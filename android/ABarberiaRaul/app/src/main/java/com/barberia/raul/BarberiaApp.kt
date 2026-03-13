package com.barberia.raul

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.barberia.raul.data.api.ApiClient
import com.barberia.raul.data.local.AppDatabase
import com.barberia.raul.data.local.UserPreferences
import com.barberia.raul.data.repository.BarberiaRepository
import com.barberia.raul.notifications.StatusPollWorker

class BarberiaApp : Application() {
    lateinit var userPreferences: UserPreferences
    lateinit var repository: BarberiaRepository
    lateinit var database: AppDatabase

    override fun onCreate() {
        super.onCreate()
        userPreferences = UserPreferences(this)
        database = AppDatabase.getInstance(this)
        repository = BarberiaRepository(ApiClient.api, userPreferences)
        createNotificationChannels()
        StatusPollWorker.enqueue(this)
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannels(listOf(
                NotificationChannel(
                    "appointment_reminders",
                    "Recordatorios de citas",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Recordatorio 24 horas antes de tu cita"
                },
                NotificationChannel(
                    "status_updates",
                    "Estado de solicitudes",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Actualizaciones sobre tus solicitudes de cancelación"
                },
                NotificationChannel(
                    "announcements",
                    "Anuncios",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Novedades de A Barbería de Raúl"
                }
            ))
        }
    }
}
