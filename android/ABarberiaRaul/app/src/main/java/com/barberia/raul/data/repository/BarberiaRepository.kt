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

    suspend fun cancelarCita(idToken: String, idCita: String, motivo: String): Result<String> = runCatching {
        val body = JSONObject().apply {
            put("action", "cancelarCita")
            put("idToken", idToken)
            put("idCita", idCita)
            put("motivo", motivo)
        }
        val responseStr = postAction(body)
        val result = json.decodeFromString<SimpleResponse>(responseStr)
        if (result.success) {
            result.mensaje ?: "Solicitud enviada"
        } else {
            throw Exception(result.error ?: "Error al cancelar")
        }
    }

    suspend fun adminLogin(password: String): Result<String> = runCatching {
        val params = mapOf("action" to "adminLogin", "password" to password)
        val response = api.getAction(params)
        val responseStr = response.body()?.string() ?: throw Exception("Empty response")
        val result = json.decodeFromString<AdminLoginResponse>(responseStr)
        if (result.success && result.token != null) {
            prefs.saveAdminToken(result.token)
            result.token
        } else {
            throw Exception(result.error ?: "Contraseña incorrecta")
        }
    }

    suspend fun getAdminDashboard(token: String): Result<AdminDashboard> = runCatching {
        val params = mapOf("action" to "getAdmin", "token" to token)
        val response = api.getAction(params)
        val responseStr = response.body()?.string() ?: throw Exception("Empty response")
        val result = json.decodeFromString<AdminResponse>(responseStr)
        if (result.success && result.dashboard != null) {
            result.dashboard
        } else {
            throw Exception(result.error ?: "Error al cargar panel")
        }
    }

    suspend fun procesarSolicitud(idSolicitud: String, estado: String, token: String): Result<String> = runCatching {
        val body = JSONObject().apply {
            put("action", "procesarSolicitud")
            put("idSolicitud", idSolicitud)
            put("estado", estado)
            put("token", token)
        }
        val responseStr = postAction(body)
        val result = json.decodeFromString<SimpleResponse>(responseStr)
        if (result.success) {
            result.mensaje ?: "Solicitud procesada"
        } else {
            throw Exception(result.error ?: "Error al procesar")
        }
    }
}
