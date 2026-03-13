package com.barberia.raul.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Solicitud(
    val idSolicitud: String,
    val idCita: String = "",
    val idCliente: String = "",
    val cliente: String = "",
    val servicio: String = "",
    val fechaCita: String = "",
    val motivo: String = ""
)
