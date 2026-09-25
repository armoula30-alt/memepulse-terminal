package com.solanasignal

import com.solanasignal.data.MetricEntity
import com.solanasignal.engine.MomentumEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MomentumEngineTest {
    private val metric = MetricEntity("mint", 300, 1L, 20, 14, 6, 12, 5, 20.0, 8.0, 1.0, 12.0, 2.4, 1.8, "COMPLETE")
    @Test fun basicEligibilityIsNotBuyTrigger() {
        val score = MomentumEngine.score(metric, 20_000.0, 80, listOf("PASS"))
        assertTrue(score.total >= 0)
        assertEquals("WATCH", MomentumEngine.classify(score, 2, true).takeIf { score.total < 80 } ?: "BUY CANDIDATE")
    }
    @Test fun unknownSafetyCannotProduceBuy() {
        val score = MomentumEngine.score(metric, 20_000.0, 80, listOf("UNKNOWN"))
        assertTrue(MomentumEngine.classify(score, 4, false) != "BUY CANDIDATE")
    }
}
