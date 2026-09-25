package com.solanasignal.network

import kotlinx.serialization.json.JsonObject

enum class ConnectionState { CONNECTING, CONNECTED, DEGRADED, RECONNECTING, DISCONNECTED }
data class NormalizedTokenCreatedEvent(val mint: String, val symbol: String?, val name: String?, val creator: String?, val uri: String?, val createdAt: Long?, val raw: JsonObject)
data class NormalizedTradeEvent(val mint: String, val txType: String?, val trader: String?, val solAmount: Double?, val tokenAmount: Double?, val marketCapSol: Double?, val signature: String?, val timestamp: Long, val raw: JsonObject)
data class NormalizedMigrationEvent(val mint: String, val timestamp: Long, val raw: JsonObject)
data class SafetyCheck(val check: String, val status: String, val reason: String, val source: String, val timestamp: Long)
data class MomentumScore(val total: Int, val buyerPressure: Int?, val volumePressure: Int?, val volumeVelocity: Int?, val priceMomentum: Int?, val liquidity: Int?, val holderDistribution: Int?, val safety: Int?, val reasons: List<String>, val unknowns: List<String>)
data class Signal(val type: String, val score: MomentumScore, val mint: String, val reasons: List<String>, val createdAt: Long)
