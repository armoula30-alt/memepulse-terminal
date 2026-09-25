package com.solanasignal.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface SignalDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsertToken(item: TokenEntity)
    @Insert(onConflict = OnConflictStrategy.IGNORE) suspend fun insertTrade(item: TradeEntity): Long
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsertMetric(item: MetricEntity)
    @Insert suspend fun insertScore(item: ScoreEntity)
    @Insert suspend fun insertSignal(item: SignalEntity)
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun putSetting(item: SettingEntity)
    @Query("SELECT * FROM signals ORDER BY timestamp DESC LIMIT 100") fun signals(): Flow<List<SignalEntity>>
    @Query("SELECT * FROM tokens ORDER BY firstSeenAt DESC LIMIT 100") fun tokens(): Flow<List<TokenEntity>>
    @Query("SELECT * FROM settings WHERE `key` = :key LIMIT 1") suspend fun setting(key: String): SettingEntity?
    @Query("SELECT * FROM metrics WHERE mint = :mint ORDER BY windowSeconds") suspend fun metrics(mint: String): List<MetricEntity>
    @Query("SELECT * FROM trades WHERE mint = :mint AND timestamp >= :since ORDER BY timestamp") suspend fun tradesSince(mint: String, since: Long): List<TradeEntity>
}

@Database(entities = [TokenEntity::class, TradeEntity::class, MetricEntity::class, ScoreEntity::class, SignalEntity::class, SignalOutcomeEntity::class, SystemEventEntity::class, SettingEntity::class], version = 1, exportSchema = false)
abstract class SignalDatabase : RoomDatabase() { abstract fun dao(): SignalDao
    companion object { @Volatile private var instance: SignalDatabase? = null
        fun get(context: Context) = instance ?: synchronized(this) { instance ?: Room.databaseBuilder(context.applicationContext, SignalDatabase::class.java, "solana-signal.db").fallbackToDestructiveMigration().build().also { instance = it } }
    }
}
