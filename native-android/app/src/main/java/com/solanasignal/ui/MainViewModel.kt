package com.solanasignal.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.solanasignal.engine.SignalRepository
import com.solanasignal.service.ScannerForegroundService
import com.solanasignal.service.ScannerRuntime
import android.content.Intent
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.*

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = SignalRepository(app)
    val state = ScannerRuntime.state
    val statusMessage = ScannerRuntime.message
    val diagnostics = repo.diagnostics
    val signals = repo.signals.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
    val tokens = repo.tokens.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
    var keyConfigured = repo.apiKeyConfigured()
    fun saveKey(key: String) { repo.setApiKey(key); keyConfigured = key.isNotBlank() }
    fun start() { if (!repo.apiKeyConfigured()) { ScannerRuntime.update(com.solanasignal.network.ConnectionState.DISCONNECTED, "API key is missing") ; return }; ContextCompat.startForegroundService(getApplication(), Intent(getApplication(), ScannerForegroundService::class.java)) }
    fun stop() { getApplication<Application>().stopService(Intent(getApplication(), ScannerForegroundService::class.java)); ScannerRuntime.update(com.solanasignal.network.ConnectionState.DISCONNECTED, "Scanner stopped") }
}
