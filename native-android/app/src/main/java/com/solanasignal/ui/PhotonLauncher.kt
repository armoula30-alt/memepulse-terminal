package com.solanasignal.ui

import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

object PhotonLauncher {
    private const val OFFICIAL_PHOTON = "https://photon-sol.tinyastro.io/"
    fun open(context: Context, mint: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("Solana mint", mint))
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(OFFICIAL_PHOTON)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        Toast.makeText(context, "Mint copied: $mint", Toast.LENGTH_LONG).show()
    }
}
