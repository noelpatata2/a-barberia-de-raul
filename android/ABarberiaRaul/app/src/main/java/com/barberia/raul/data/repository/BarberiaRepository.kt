package com.barberia.raul.data.repository

import com.barberia.raul.data.api.BarberiaApi
import com.barberia.raul.data.local.UserPreferences
import com.barberia.raul.data.model.*
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class BarberiaRepository(
    private val api: BarberiaApi,
    private val prefs: UserPreferences
) {
    private val json = Json { ignoreUnknownKeys = true }

    private suspend fun postAction(body: JSONObject): String {
        val requestBody = body.toString().toRequestBody("text/plain; charset=utf-8".toMediaType())
        val response = api.postAction(requestBody)
        return response.body()?.string() ?: throw Exception("Empty response")
    }

    suspend fun getCliente(idToken: String): Result<Cliente> = runCatching {
        val body = JSONObject().apply {
            put("action", "getCliente")
            put("idToken", idToken)
        }
        val responseStr = postAction(body)
        val result = json.decodeFromString<ClienteResponse>(responseStr)
        if (result.success && result.cliente != null) {
            prefs.saveSession(idToken, result.cliente.id, result.cliente.nombre, result.cliente.email, result.cliente.foto)
            result.cliente
        } else {
            throw Exception(result.error ?: "Error al iniciar sesión")
        }
    }

    suspend fun getCitas(idToken: String): Result<List<Cita>> = runCatching {
        val body = JSONObject().apply {
            put("action", "getCitas")
            put("idToken", idToken)
        }
        val responseStr = postAction(body)
        val result = json.decodeFromString<CitasResponse>(responseStr)
        if (result.success) {
            prefs.saveCachedCitas(Json.encodeToString(CitasResponse.serializer(), result))
            result.citas
        } else {
            throw Exception(result.error ?: "Error al cargar citas")
        }
    }
}
