package com.barberia.raul.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Cita(
    val idCita: String,
    val clienteId: String = "",
    val servicio: String,
    val fecha: String,
    val horaInicio: String,
    val horaFin: String = "",
    val estado: String
)
