package com.barberia.raul.ui.screens.dashboard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.barberia.raul.BarberiaApp
import com.barberia.raul.data.model.Cita
import com.barberia.raul.notifications.NotificationHelper
import com.barberia.raul.notifications.StatusPollWorker
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate

data class DashboardUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val nombre: String = "",
    val foto: String = "",
    val nextCita: Cita? = null,
    val allCitas: List<Cita> = emptyList(),
    val error: String? = null,
    val debugMessage: String? = null
)

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as BarberiaApp
    private val repository = app.repository
    private val prefs = app.userPreferences

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            prefs.clienteNombre.collect { nombre ->
                _uiState.update { it.copy(nombre = nombre ?: "") }
            }
        }
        viewModelScope.launch {
            prefs.clienteFoto.collect { foto ->
                _uiState.update { it.copy(foto = foto ?: "") }
            }
        }
        loadCitas()
    }

    fun loadCitas() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = _uiState.value.allCitas.isEmpty(), isRefreshing = _uiState.value.allCitas.isNotEmpty()) }
            prefs.idToken.first()?.let { token ->
                repository.getCitas(token).fold(
                    onSuccess = { citas ->
                        val futureCitas = citas
                            .filter { isFutureOrToday(it.fecha) }
                            .sortedWith(compareBy({ it.fecha }, { it.horaInicio }))
                        val confirmedFuture = futureCitas.filter { it.estado.contains("Confirmada", true) }
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                isRefreshing = false,
                                nextCita = confirmedFuture.firstOrNull(),
                                allCitas = futureCitas,
                                error = null
                            )
                        }
                        // Schedule reminders for confirmed appointments
                        scheduleReminders(confirmedFuture)
                    },
                    onFailure = { e ->
                        _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = e.message) }
                    }
                )
            } ?: run {
                _uiState.update { it.copy(isLoading = false, error = "Sesión expirada") }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            prefs.clearSession()
        }
    }

    // DEBUG: Triggers poll worker immediately + fires a sample reminder notification
    fun debugTestNotifications() {
        val context = getApplication<BarberiaApp>()

        // 1. Fire a sample reminder notification right now
        NotificationHelper.showNotification(
            context = context,
            channelId = "appointment_reminders",
            title = "Recordatorio de cita",
            message = "Tu cita de Corte de pelo es mañana a las 10:00 (TEST)",
            notificationId = 99999
        )

        // 2. Trigger the status poll worker immediately
        val oneTimeWork = OneTimeWorkRequestBuilder<StatusPollWorker>().build()
        WorkManager.getInstance(context).enqueue(oneTimeWork)

        _uiState.update { it.copy(debugMessage = "Reminder notification sent + poll worker triggered. Change an Estado in Sheets and tap again to test status notifications.") }
    }

    private fun isFutureOrToday(fecha: String): Boolean {
        return try {
            val date = LocalDate.parse(fecha)
            !date.isBefore(LocalDate.now())
        } catch (e: Exception) { true }
    }

    private fun scheduleReminders(citas: List<Cita>) {
        val context = getApplication<BarberiaApp>()
        com.barberia.raul.notifications.ReminderScheduler.scheduleAll(context, citas)
    }
}
