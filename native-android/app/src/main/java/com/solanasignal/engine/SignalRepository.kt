package com.solanasignal.engine

import android.content.Context
import com.solanasignal.data.*
import com.solanasignal.network.*
import com.solanasignal.security.Secrets
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.util.UUID

class SignalRepository(context: Context) {
    private val db = SignalDatabase.get(context); private val dao = db.dao(); private val secrets = Secrets(context)
    private val manager = PumpPortalWebSocketManager { secrets.getPumpPortalKey() }
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    val connection = manager.state; val diagnostics = manager.diagnostics; val signals = dao.signals(); val tokens = dao.tokens()
    fun setApiKey(value: String) { secrets.setPumpPortalKey(value) }
    fun apiKeyConfigured() = secrets.getPumpPortalKey().isNotBlank()
    fun start() { manager.start(); scope.launch { manager.events.collect { event -> when (event) { is NormalizedTokenCreatedEvent -> onToken(event); is NormalizedTradeEvent -> onTrade(event); is NormalizedMigrationEvent -> onMigration(event) } } } }
    fun stop() { manager.stop() }
    private suspend fun onToken(event: NormalizedTokenCreatedEvent) { dao.upsertToken(TokenEntity(event.mint, event.symbol, event.name, event.creator, event.uri, event.createdAt, System.currentTimeMillis(), null, null, null)); manager.subscribeToken(event.mint) }
    private suspend fun onMigration(event: NormalizedMigrationEvent) { dao.upsertToken(TokenEntity(event.mint, null, null, null, null, null, event.timestamp, null, null, null, "MIGRATED")) }
    private suspend fun onTrade(event: NormalizedTradeEvent) {
        val dedupe = event.signature ?: "${event.mint}|${event.timestamp}|${event.txType}|${event.trader}|${event.solAmount}|${event.tokenAmount}"
        val inserted = dao.insertTrade(TradeEntity(dedupe, event.mint, event.txType, event.trader, event.solAmount, event.tokenAmount, event.marketCapSol, null, event.timestamp, event.signature))
        if (inserted == -1L) return
        val rows = dao.tradesSince(event.mint, System.currentTimeMillis() - 300_000)
        val buys = rows.count { it.txType.equals("buy", true) }; val sells = rows.count { it.txType.equals("sell", true) }
        val buyVol = rows.filter { it.txType.equals("buy", true) }.sumOf { it.solAmount ?: 0.0 }; val sellVol = rows.filter { it.txType.equals("sell", true) }.sumOf { it.solAmount ?: 0.0 }
        val metric = MetricEntity(event.mint, 300, System.currentTimeMillis(), rows.size, buys, sells, rows.filter { it.txType.equals("buy", true) }.mapNotNull { it.trader }.toSet().size, rows.filter { it.txType.equals("sell", true) }.mapNotNull { it.trader }.toSet().size, buyVol, sellVol, event.tokenAmount, null, null, null, "PARTIAL")
        dao.upsertMetric(metric)
        val eligibility = MomentumEngine.eligibility(null, null, buys, sells, buyVol, sellVol)
        val score = MomentumEngine.score(metric, null, null, listOf("UNKNOWN")); val confirmations = listOf(score.buyerPressure, score.volumePressure, score.volumeVelocity, score.priceMomentum).count { it != null && it >= 70 }
        val type = MomentumEngine.classify(score, confirmations, safetyPassed = false)
        if (type != "REJECTED") { dao.insertScore(ScoreEntity(event.mint, System.currentTimeMillis(), score.total, score.buyerPressure, score.volumePressure, score.volumeVelocity, score.priceMomentum, score.liquidity, score.holderDistribution, score.safety, score.reasons.joinToString("; "), score.unknowns.joinToString("; "))); dao.insertSignal(SignalEntity(UUID.randomUUID().toString(), event.mint, System.currentTimeMillis(), type, score.total, score.reasons.joinToString("; "), null, null, buys, sells, buyVol, sellVol, event.tokenAmount)) }
    }
}
