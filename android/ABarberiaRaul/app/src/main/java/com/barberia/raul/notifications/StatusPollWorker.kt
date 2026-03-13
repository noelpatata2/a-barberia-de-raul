package com.barberia.raul.notifications

import android.content.Context
import androidx.work.*
import com.barberia.raul.BarberiaApp
import com.barberia.raul.data.local.CachedCitaState
import kotlinx.coroutines.flow.first
import java.util.concurrent.TimeUnit

class StatusPollWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? BarberiaApp ?: return Result.failure()
        val token = app.userPreferences.idToken.first() ?: return Result.retry()

        val repository = app.repository
        val dao = app.database.notificationDao()

        val citasResult = repository.getCitas(token)
        if (citasResult.isFailure) return Result.retry()

        val citas = citasResult.getOrDefault(emptyList())
        val cachedStates = dao.getAllCachedStates()
        val cachedMap = cachedStates.associateBy { it.idCita }

        for (cita in citas) {
            val cached = cachedMap[cita.idCita]
            if (cached != null && cached.estado != cita.estado) {
                // Status changed! Send notification
                val (title, message) = when {
                    cita.estado.contains("Cancelada", true) && !cita.estado.contains("Pendiente", true) ->
                        "Cancelación aprobada" to "Tu solicitud de cancelación para ${cita.servicio} ha sido aprobada."
                    cached.estado.contains("Pendiente", true) && cita.estado.contains("Confirmada", true) ->
                        "Cancelación rechazada" to "Tu solicitud de cancelación para ${cita.servicio} ha sido rechazada. La cita se mantiene."
                    else ->
                        "Actualización de cita" to "Tu cita de ${cita.servicio} ha cambiado a: ${cita.estado}"
                }

                NotificationHelper.showNotification(
                    context = applicationContext,
                    channelId = "status_updates",
                    title = title,
                    message = message,
                    notificationId = cita.idCita.hashCode() + 1000
                )
            }
        }

        // Update cache
        val newStates = citas.map {
            CachedCitaState(
                idCita = it.idCita,
                estado = it.estado,
                servicio = it.servicio,
                fecha = it.fecha,
                horaInicio = it.horaInicio
            )
        }
        dao.upsertAllCitaStates(newStates)

        return Result.success()
    }

    companion object {
        private const val WORK_NAME = "status_poll"

        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = PeriodicWorkRequestBuilder<StatusPollWorker>(
                15, TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 5, TimeUnit.MINUTES)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }
    }
}
