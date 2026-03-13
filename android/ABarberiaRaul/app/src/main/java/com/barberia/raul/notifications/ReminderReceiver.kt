package com.barberia.raul.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val servicio = intent.getStringExtra("servicio") ?: "tu cita"
        val hora = intent.getStringExtra("horaInicio") ?: ""

        NotificationHelper.showNotification(
            context = context,
            channelId = "appointment_reminders",
            title = "Recordatorio de cita",
            message = "Tu cita de $servicio es mañana a las $hora",
            notificationId = intent.getStringExtra("citaId")?.hashCode() ?: System.currentTimeMillis().toInt()
        )
    }
}
