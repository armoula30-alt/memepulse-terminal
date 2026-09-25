package com.solanasignal.data

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "tokens", primaryKeys = ["mint"], indices = [Index("createdAt")])
data class TokenEntity(val mint: String, val symbol: String?, val name: String?, val creator: String?, val uri: String?, val createdAt: Long?, val firstSeenAt: Long, val marketCapUsd: Double?, val liquidityUsd: Double?, val priceUsd: Double?, val lifecycle: String = "UNKNOWN", val source: String = "pumpportal")
@Entity(tableName = "trades", primaryKeys = ["dedupeKey"], indices = [Index("mint"), Index("timestamp")])
data class TradeEntity(val dedupeKey: String, val mint: String, val txType: String?, val trader: String?, val solAmount: Double?, val tokenAmount: Double?, val marketCapSol: Double?, val priceUsd: Double?, val timestamp: Long, val signature: String?)
@Entity(tableName = "metrics", primaryKeys = ["mint", "windowSeconds"])
data class MetricEntity(val mint: String, val windowSeconds: Int, val updatedAt: Long, val trades: Int, val buys: Int, val sells: Int, val uniqueBuyers: Int, val uniqueSellers: Int, val buyVolumeSol: Double?, val sellVolumeSol: Double?, val latestPriceUsd: Double?, val priceChangePct: Double?, val volumeVelocity: Double?, val buyerVelocity: Double?, val dataQuality: String)
@Entity(tableName = "scores", primaryKeys = ["mint", "timestamp"])
data class ScoreEntity(val mint: String, val timestamp: Long, val total: Int, val buyerPressure: Int?, val volumePressure: Int?, val volumeVelocity: Int?, val priceMomentum: Int?, val liquidity: Int?, val holderDistribution: Int?, val safety: Int?, val reasons: String, val unknowns: String)
@Entity(tableName = "signals", primaryKeys = ["id"], indices = [Index("mint"), Index("timestamp"), Index("signalType"), Index("score")])
data class SignalEntity(val id: String, val mint: String, val timestamp: Long, val signalType: String, val score: Int, val reasons: String, val marketCapUsd: Double?, val liquidityUsd: Double?, val buyers: Int?, val sellers: Int?, val buyVolume: Double?, val sellVolume: Double?, val priceUsd: Double?)
@Entity(tableName = "signal_outcomes", primaryKeys = ["signalId", "horizonSeconds"])
data class SignalOutcomeEntity(val signalId: String, val horizonSeconds: Int, val baselinePriceUsd: Double?, val observedPriceUsd: Double?, val hypotheticalChangePct: Double?, val status: String)
@Entity(tableName = "system_events", primaryKeys = ["id"], indices = [Index("timestamp")])
data class SystemEventEntity(val id: String, val timestamp: Long, val level: String, val type: String, val message: String)
@Entity(tableName = "settings")
data class SettingEntity(@PrimaryKey val key: String, val value: String)
