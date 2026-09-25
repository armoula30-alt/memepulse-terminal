package com.solanasignal.network

import android.os.SystemClock
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.json.*
import okhttp3.*
import java.util.concurrent.TimeUnit
import kotlin.math.min

class PumpPortalWebSocketManager(private val apiKey: suspend () -> String) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val client = OkHttpClient.Builder().readTimeout(0, TimeUnit.MILLISECONDS).pingInterval(20, TimeUnit.SECONDS).build()
    private val _state = MutableStateFlow(ConnectionState.DISCONNECTED); val state: StateFlow<ConnectionState> = _state.asStateFlow()
    private val _events = MutableSharedFlow<Any>(extraBufferCapacity = 512); val events: SharedFlow<Any> = _events.asSharedFlow()
    private val _diagnostics = MutableStateFlow(Diagnostics()); val diagnostics: StateFlow<Diagnostics> = _diagnostics.asStateFlow()
    private var socket: WebSocket? = null
    private var reconnectAttempt = 0
    private var stopped = true
    private val trackedTokens = LinkedHashSet<String>()
    private val trackedAccounts = LinkedHashSet<String>()
    private var lastMessageAt = 0L
    private var messages = 0L

    data class Diagnostics(val lastEventAt: Long? = null, val latencyMs: Long? = null, val reconnects: Int = 0, val parserErrors: Int = 0, val messages: Long = 0, val lastError: String? = null)

    fun start() { if (!stopped) return; stopped = false; connect() }
    fun stop() { stopped = true; socket?.close(1000, "stopped"); socket = null; _state.value = ConnectionState.DISCONNECTED }
    fun subscribeToken(mint: String) { if (trackedTokens.add(mint)) send(mapOf("method" to "subscribeTokenTrade", "keys" to listOf(mint))) }
    fun unsubscribeToken(mint: String) { if (trackedTokens.remove(mint)) send(mapOf("method" to "unsubscribeTokenTrade", "keys" to listOf(mint))) }
    fun subscribeAccount(address: String) { if (trackedAccounts.add(address)) send(mapOf("method" to "subscribeAccountTrade", "keys" to listOf(address))) }
    fun unsubscribeAccount(address: String) { if (trackedAccounts.remove(address)) send(mapOf("method" to "unsubscribeAccountTrade", "keys" to listOf(address))) }

    private fun connect() {
        scope.launch {
            val key = apiKey()
            if (key.isBlank()) { _state.value = ConnectionState.DISCONNECTED; _diagnostics.value = _diagnostics.value.copy(lastError = "API key is missing"); return@launch }
            withContext(Dispatchers.Main) { _state.value = if (reconnectAttempt == 0) ConnectionState.CONNECTING else ConnectionState.RECONNECTING }
            val request = Request.Builder().url("wss://pumpportal.fun/api/data?api-key=${java.net.URLEncoder.encode(key, "UTF-8")}").build()
            socket = client.newWebSocket(request, listener)
        }
    }

    private val listener = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) { reconnectAttempt = 0; _state.value = ConnectionState.CONNECTED; send(mapOf("method" to "subscribeNewToken")); send(mapOf("method" to "subscribeMigration")); trackedTokens.chunked(5000).forEach { send(mapOf("method" to "subscribeTokenTrade", "keys" to it)) }; trackedAccounts.chunked(5000).forEach { send(mapOf("method" to "subscribeAccountTrade", "keys" to it)) } }
        override fun onMessage(webSocket: WebSocket, text: String) { lastMessageAt = SystemClock.elapsedRealtime(); messages++; _diagnostics.value = _diagnostics.value.copy(lastEventAt = System.currentTimeMillis(), messages = messages); parse(text) }
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) { _state.value = ConnectionState.DISCONNECTED; _diagnostics.value = _diagnostics.value.copy(lastError = "WebSocket failure: ${t.javaClass.simpleName}"); scheduleReconnect() }
        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) { if (!stopped) { _state.value = ConnectionState.RECONNECTING; _diagnostics.value = _diagnostics.value.copy(lastError = "WebSocket closed: $code"); scheduleReconnect() } }
    }

    private fun parse(text: String) {
        runCatching {
            val obj = Json.parseToJsonElement(text).jsonObject
            val mint = obj["mint"]?.jsonPrimitive?.contentOrNull ?: return@runCatching
            val now = System.currentTimeMillis()
            when {
                obj["txType"] != null -> _events.tryEmit(NormalizedTradeEvent(mint, obj["txType"]?.jsonPrimitive?.contentOrNull, obj["traderPublicKey"]?.jsonPrimitive?.contentOrNull, obj["solAmount"]?.jsonPrimitive?.doubleOrNull, obj["tokenAmount"]?.jsonPrimitive?.doubleOrNull, obj["marketCapSol"]?.jsonPrimitive?.doubleOrNull, obj["signature"]?.jsonPrimitive?.contentOrNull ?: obj["txHash"]?.jsonPrimitive?.contentOrNull, now, obj))
                obj["pool"] != null || obj["migration"] != null -> _events.tryEmit(NormalizedMigrationEvent(mint, now, obj))
                else -> _events.tryEmit(NormalizedTokenCreatedEvent(mint, obj["symbol"]?.jsonPrimitive?.contentOrNull, obj["name"]?.jsonPrimitive?.contentOrNull, obj["traderPublicKey"]?.jsonPrimitive?.contentOrNull, obj["uri"]?.jsonPrimitive?.contentOrNull, now, obj))
            }
        }.onFailure { _diagnostics.value = _diagnostics.value.copy(parserErrors = _diagnostics.value.parserErrors + 1) }
    }

    private fun send(payload: Map<String, Any>) { val json = buildJsonObject { payload.forEach { (key, value) -> put(key, when (value) { is String -> JsonPrimitive(value); is List<*> -> JsonArray(value.map { JsonPrimitive(it.toString()) }); else -> JsonPrimitive(value.toString()) }) } }.toString(); if (socket?.send(json) != true) return }
    private fun scheduleReconnect() { if (stopped) return; val attempt = reconnectAttempt++; val delayMs = min(60_000L, 1_000L * (1L shl min(attempt, 6))); _diagnostics.value = _diagnostics.value.copy(reconnects = _diagnostics.value.reconnects + 1); scope.launch { delay(delayMs); if (!stopped) connect() } }
}
