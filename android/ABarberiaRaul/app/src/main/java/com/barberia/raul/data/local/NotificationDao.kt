package com.barberia.raul.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface NotificationDao {
    @Query("SELECT * FROM cached_cita_states")
    suspend fun getAllCachedStates(): List<CachedCitaState>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertCitaState(state: CachedCitaState)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAllCitaStates(states: List<CachedCitaState>)

    @Query("DELETE FROM cached_cita_states")
    suspend fun clearAll()
}
