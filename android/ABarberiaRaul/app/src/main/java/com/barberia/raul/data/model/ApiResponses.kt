package com.barberia.raul.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ClienteResponse(
    val success: Boolean,
    val cliente: Cliente? = null,
    val error: String? = null
)

@Serializable
data class CitasResponse(
    val success: Boolean,
    val citas: List<Cita> = emptyList(),
    val total: Int = 0,
    val error: String? = null
)

@Serializable
data class SimpleResponse(
    val success: Boolean,
    val mensaje: String? = null,
    val error: String? = null
)

@Serializable
data class AdminLoginResponse(
    val success: Boolean,
    val token: String? = null,
    val error: String? = null
)

@Serializable
data class Estadisticas(
    val totalCitasHoy: Int = 0,
    val citasActivas: Int = 0,
    val citasCanceladas: Int = 0,
    val solicitudesPendientes: Int = 0
)

@Serializable
data class AdminDashboard(
    val fecha: String = "",
    val citasHoy: List<Cita> = emptyList(),
    val solicitudesPendientes: List<Solicitud> = emptyList(),
    val estadisticas: Estadisticas = Estadisticas()
)

@Serializable
data class AdminResponse(
    val success: Boolean,
    val dashboard: AdminDashboard? = null,
    val error: String? = null
)
