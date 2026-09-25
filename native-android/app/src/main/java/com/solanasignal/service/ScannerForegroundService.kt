package com.solanasignal.service

import android.app.*
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.solanasignal.R
import com.solanasignal.engine.SignalRepository
import com.solanasignal.network.ConnectionState
import kotlinx.coroutines.*

class ScannerForegroundService : Service() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var repo: SignalRepository
    override fun onCreate() { super.onCreate(); repo = SignalRepository(this); createChannels(); startForeground(100, notification("Scanner starting")); repo.start(); signalNotifications(); scope.launch { repo.connection.collect { state -> update(notification("PumpPortal: ${state.name}")) } } }
    private fun signalNotifications() { scope.launch { var seen = emptySet<String>(); repo.signals.collect { items -> items.filterNot { seen.contains(it.id) }.forEach { signal -> seen += signal.id; val channel = if (signal.signalType.contains("BUY")) "buy" else if (signal.signalType.contains("SELL")) "sell" else "system"; getSystemService(NotificationManager::class.java).notify(signal.id.hashCode(), NotificationCompat.Builder(this@ScannerForegroundService, channel).setSmallIcon(android.R.drawable.ic_dialog_info).setContentTitle("${signal.signalType} · ${signal.score}/100").setContentText("${signal.mint}: ${signal.reasons.ifBlank { "Reasons: UNKNOWN" }}").setAutoCancel(true).build()) } } } }
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int) = START_STICKY
    override fun onDestroy() { repo.stop(); scope.cancel(); super.onDestroy() }
    override fun onBind(intent: Intent?): IBinder? = null
    private fun createChannels() { val manager = getSystemService(NotificationManager::class.java); listOf("buy" to "BUY SIGNALS", "sell" to "SELL SIGNALS", "safety" to "SAFETY ALERTS", "system" to "SYSTEM ALERTS").forEach { (id, name) -> manager.createNotificationChannel(NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH)) } }
    private fun notification(text: String) = NotificationCompat.Builder(this, "system").setSmallIcon(android.R.drawable.ic_dialog_info).setContentTitle("Solana Signal").setContentText(text).setOngoing(true).build()
    private fun update(n: Notification) { getSystemService(NotificationManager::class.java).notify(100, n) }
}
