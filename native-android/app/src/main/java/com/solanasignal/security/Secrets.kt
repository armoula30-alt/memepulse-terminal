package com.solanasignal.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class Secrets(context: Context) {
    private val prefs = EncryptedSharedPreferences.create(context, "secure_settings", MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(), EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV, EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM)
    fun getPumpPortalKey(): String = prefs.getString("pumpportal_api_key", "") ?: ""
    fun setPumpPortalKey(value: String) { prefs.edit().putString("pumpportal_api_key", value.trim()).apply() }
}
