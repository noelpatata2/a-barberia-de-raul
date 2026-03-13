package com.barberia.raul.ui.screens.admin

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.barberia.raul.BarberiaApp
import com.barberia.raul.data.model.AdminDashboard
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AdminUiState(
    val isLoggedIn: Boolean = false,
    val isLoading: Boolean = false,
    val password: String = "",
    val loginError: String? = null,
    val dashboard: AdminDashboard? = null,
    val actionMessage: String? = null
)

class AdminViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as BarberiaApp
    private val repository = app.repository
    private val prefs = app.userPreferences

    private val _uiState = MutableStateFlow(AdminUiState())
    val uiState: StateFlow<AdminUiState> = _uiState.asStateFlow()

    private var adminToken: String? = null

    init {
        viewModelScope.launch {
            prefs.adminToken.collect { token ->
                if (token != null) {
                    adminToken = token
                    _uiState.update { it.copy(isLoggedIn = true) }
                    loadDashboard()
                }
            }
        }
    }

    fun updatePassword(pw: String) {
        _uiState.update { it.copy(password = pw) }
    }

    fun login() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, loginError = null) }
            repository.adminLogin(_uiState.value.password).fold(
                onSuccess = { token ->
                    adminToken = token
                    _uiState.update { it.copy(isLoading = false, isLoggedIn = true) }
                    loadDashboard()
                },
                onFailure = { e ->
                    _uiState.update { it.copy(isLoading = false, loginError = e.message) }
                }
            )
        }
    }

    fun loadDashboard() {
        val token = adminToken ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.getAdminDashboard(token).fold(
                onSuccess = { dashboard ->
                    _uiState.update { it.copy(isLoading = false, dashboard = dashboard) }
                },
                onFailure = { e ->
                    _uiState.update { it.copy(isLoading = false, loginError = e.message) }
                }
            )
        }
    }

    fun procesarSolicitud(idSolicitud: String, estado: String) {
        val token = adminToken ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.procesarSolicitud(idSolicitud, estado, token).fold(
                onSuccess = { msg ->
                    _uiState.update { it.copy(isLoading = false, actionMessage = msg) }
                    loadDashboard()
                },
                onFailure = { e ->
                    _uiState.update { it.copy(isLoading = false, actionMessage = e.message) }
                }
            )
        }
    }

    fun logout() {
        viewModelScope.launch {
            prefs.clearAdminToken()
            adminToken = null
            _uiState.update { AdminUiState() }
        }
    }
}
