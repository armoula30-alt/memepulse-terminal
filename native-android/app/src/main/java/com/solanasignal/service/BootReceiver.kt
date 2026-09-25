package com.solanasignal.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.solanasignal.security.Secrets

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED && Secrets(context).getPumpPortalKey().isNotBlank()) {
            ContextCompat.startForegroundService(context, Intent(context, ScannerForegroundService::class.java))
        }
    }
}
