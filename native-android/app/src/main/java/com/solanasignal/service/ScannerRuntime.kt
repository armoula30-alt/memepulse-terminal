package com.solanasignal.service

import com.solanasignal.network.ConnectionState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object ScannerRuntime {
    private val _state = MutableStateFlow(ConnectionState.DISCONNECTED)
    val state = _state.asStateFlow()
    private val _message = MutableStateFlow("Scanner is stopped")
    val message = _message.asStateFlow()
    fun update(state: ConnectionState, message: String = state.name) { _state.value = state; _message.value = message }
}
