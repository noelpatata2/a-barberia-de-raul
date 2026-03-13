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
