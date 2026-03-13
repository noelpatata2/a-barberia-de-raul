package com.barberia.raul.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.barberia.raul.BarberiaApp
import com.barberia.raul.data.model.CitasResponse
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.serialization.json.Json

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        val app = context.applicationContext as? BarberiaApp ?: return
        val pendingResult = goAsync()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val cachedJson = app.userPreferences.cachedCitas.first()
                if (cachedJson != null) {
                    val json = Json { ignoreUnknownKeys = true }
                    val response = json.decodeFromString<CitasResponse>(cachedJson)
                    val confirmedCitas = response.citas.filter {
                        it.estado.contains("Confirmada", true)
                    }
                    ReminderScheduler.scheduleAll(context, confirmedCitas)
                }
            } catch (_: Exception) {
                // Reminders will be rescheduled on next app open
            } finally {
                pendingResult.finish()
            }
        }
    }
}
