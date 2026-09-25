package com.solanasignal.engine

import com.solanasignal.data.MetricEntity
import com.solanasignal.network.MomentumScore
import kotlin.math.max
import kotlin.math.min

object MomentumEngine {
    data class Eligibility(val eligible: Boolean, val reasons: List<String>)
    fun eligibility(ageSeconds: Long?, marketCapUsd: Double?, buyers: Int, sellers: Int, buyVolume: Double?, sellVolume: Double?): Eligibility {
        val reasons = mutableListOf<String>()
        if (ageSeconds == null || ageSeconds > 300) reasons += "Token age is UNKNOWN or above 300s" else reasons += "Age within 300s"
        if (marketCapUsd == null || marketCapUsd < 10_000) reasons += "Market cap is UNKNOWN or below $10K"
        if (buyers <= sellers) reasons += "Buyers are not greater than sellers"
        if (buyVolume == null || sellVolume == null || buyVolume <= sellVolume) reasons += "Buy volume is not greater than sell volume"
        return Eligibility(reasons.size == 4 && reasons.none { it.contains("UNKNOWN") || it.contains("not") || it.contains("below") }, reasons)
    }
    fun score(metric: MetricEntity, liquidityUsd: Double?, holderDistribution: Int?, safety: List<String>): MomentumScore {
        val unknowns = mutableListOf<String>(); val reasons = mutableListOf<String>()
        val buyerPressure = if (metric.buys + metric.sells > 0) (100.0 * metric.buys / (metric.buys + metric.sells)).toInt() else null
        val volumePressure = if ((metric.buyVolumeSol ?: 0.0) + (metric.sellVolumeSol ?: 0.0) > 0) (100.0 * (metric.buyVolumeSol ?: 0.0) / ((metric.buyVolumeSol ?: 0.0) + (metric.sellVolumeSol ?: 0.0))).toInt() else null
        val velocity = metric.volumeVelocity?.let { (min(2.0, max(0.0, it)) * 50).toInt() }
        val price = metric.priceChangePct?.let { min(100.0, max(0.0, 50 + it * 2)).toInt() }
        val liquidity = liquidityUsd?.let { min(100.0, max(0.0, it / 1_000.0)).toInt() }
        listOf("Buyer Pressure" to buyerPressure, "Volume Pressure" to volumePressure, "Volume Velocity" to velocity, "Price Momentum" to price, "Liquidity" to liquidity, "Holder Distribution" to holderDistribution).forEach { (name, value) -> if (value == null) unknowns += name else if (value >= 70) reasons += "$name confirms momentum" }
        val safetyScore = when { safety.any { it == "FAIL" } -> 0; safety.any { it == "UNKNOWN" } -> null; else -> 100 }
        if (safetyScore == null) unknowns += "Safety" else if (safetyScore >= 70) reasons += "Safety checks passed"
        val weighted = listOf(buyerPressure to .25, volumePressure to .25, velocity to .15, price to .10, liquidity to .10, holderDistribution to .10, safetyScore to .05)
        val known = weighted.filter { it.first != null }; val total = if (known.isEmpty()) 0 else (known.sumOf { (it.first!! * it.second) } / known.sumOf { it.second } * 1.0).toInt()
        return MomentumScore(total.coerceIn(0, 100), buyerPressure, volumePressure, velocity, price, liquidity, holderDistribution, safetyScore, reasons, unknowns)
    }
    fun classify(score: MomentumScore, independentConfirmations: Int, safetyPassed: Boolean): String = when {
        score.total >= 80 && independentConfirmations >= 3 && safetyPassed && score.unknowns.isEmpty() -> "BUY CANDIDATE"
        score.total >= 70 -> "WATCH"
        else -> "REJECTED"
    }
}
