package com.barberia.raul.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_cita_states")
data class CachedCitaState(
    @PrimaryKey val idCita: String,
    val estado: String,
    val servicio: String = "",
    val fecha: String = "",
    val horaInicio: String = ""
)
