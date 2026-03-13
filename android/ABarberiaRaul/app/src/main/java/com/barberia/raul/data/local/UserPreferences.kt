package com.barberia.raul.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_prefs")

class UserPreferences(private val context: Context) {
    companion object {
        private val KEY_ID_TOKEN = stringPreferencesKey("id_token")
        private val KEY_CLIENTE_ID = stringPreferencesKey("cliente_id")
        private val KEY_CLIENTE_NOMBRE = stringPreferencesKey("cliente_nombre")
        private val KEY_CLIENTE_EMAIL = stringPreferencesKey("cliente_email")
        private val KEY_CLIENTE_FOTO = stringPreferencesKey("cliente_foto")
        private val KEY_CACHED_CITAS = stringPreferencesKey("cached_citas")
        private val KEY_ADMIN_TOKEN = stringPreferencesKey("admin_token")
    }

    val isLoggedIn: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_ID_TOKEN] != null
    }

    val idToken: Flow<String?> = context.dataStore.data.map { it[KEY_ID_TOKEN] }
    val clienteNombre: Flow<String?> = context.dataStore.data.map { it[KEY_CLIENTE_NOMBRE] }
    val clienteEmail: Flow<String?> = context.dataStore.data.map { it[KEY_CLIENTE_EMAIL] }
    val clienteFoto: Flow<String?> = context.dataStore.data.map { it[KEY_CLIENTE_FOTO] }
    val clienteId: Flow<String?> = context.dataStore.data.map { it[KEY_CLIENTE_ID] }

    suspend fun getIdTokenSync(): String? {
        return context.dataStore.data.first()[KEY_ID_TOKEN]
    }

    suspend fun saveSession(idToken: String, id: String, nombre: String, email: String, foto: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ID_TOKEN] = idToken
            prefs[KEY_CLIENTE_ID] = id
            prefs[KEY_CLIENTE_NOMBRE] = nombre
            prefs[KEY_CLIENTE_EMAIL] = email
            prefs[KEY_CLIENTE_FOTO] = foto
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { it.clear() }
    }

    suspend fun saveCachedCitas(citasJson: String) {
        context.dataStore.edit { it[KEY_CACHED_CITAS] = citasJson }
    }

    val cachedCitas: Flow<String?> = context.dataStore.data.map { it[KEY_CACHED_CITAS] }

    suspend fun saveAdminToken(token: String) {
        context.dataStore.edit { it[KEY_ADMIN_TOKEN] = token }
    }

    suspend fun clearAdminToken() {
        context.dataStore.edit { it.remove(KEY_ADMIN_TOKEN) }
    }

    val adminToken: Flow<String?> = context.dataStore.data.map { it[KEY_ADMIN_TOKEN] }
}
