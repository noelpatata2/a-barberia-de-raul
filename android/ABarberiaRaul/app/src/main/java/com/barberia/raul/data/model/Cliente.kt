package com.barberia.raul.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Cliente(
    val id: String = "",
    val nombre: String = "",
    val email: String = "",
    val telefono: String = "",
    val foto: String = ""
)
