package com.barberia.raul.ui.screens.detail

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.barberia.raul.BarberiaApp
import com.barberia.raul.data.model.Cita
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class DetailUiState(
    val isLoading: Boolean = true,
    val cita: Cita? = null,
    val isCancelling: Boolean = false,
    val cancelSuccess: Boolean = false,
    val error: String? = null
)

class DetailViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as BarberiaApp
    private val repository = app.repository
    private val prefs = app.userPreferences

    private val _uiState = MutableStateFlow(DetailUiState())
    val uiState: StateFlow<DetailUiState> = _uiState.asStateFlow()

    fun loadCita(citaId: String) {
        viewModelScope.launch {
            prefs.idToken.first()?.let { token ->
                repository.getCitas(token).fold(
                    onSuccess = { citas ->
                        val cita = citas.find { it.idCita == citaId }
                        _uiState.update { it.copy(isLoading = false, cita = cita) }
                    },
                    onFailure = { e ->
                        _uiState.update { it.copy(isLoading = false, error = e.message) }
                    }
                )
            }
        }
    }

    fun cancelarCita(motivo: String) {
        val cita = _uiState.value.cita ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isCancelling = true) }
            prefs.idToken.first()?.let { token ->
                repository.cancelarCita(token, cita.idCita, motivo).fold(
                    onSuccess = {
                        _uiState.update {
                            it.copy(
                                isCancelling = false,
                                cancelSuccess = true,
                                cita = cita.copy(estado = "Cancelación Pendiente")
                            )
                        }
                    },
                    onFailure = { e ->
                        _uiState.update { it.copy(isCancelling = false, error = e.message) }
                    }
                )
            }
        }
    }
}
