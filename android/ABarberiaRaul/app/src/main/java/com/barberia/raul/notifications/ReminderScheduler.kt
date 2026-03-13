package com.barberia.raul.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.barberia.raul.data.model.Cita
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId

object ReminderScheduler {
    fun scheduleAll(context: Context, citas: List<Cita>) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // Check permission on Android 12+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            return
        }

        for (cita in citas) {
            if (!cita.estado.contains("Confirmada", true)) continue

            try {
                val date = LocalDate.parse(cita.fecha)
                val time = LocalTime.parse(cita.horaInicio)
                val appointmentMillis = date.atTime(time)
                    .atZone(ZoneId.systemDefault())
                    .toInstant()
                    .toEpochMilli()

                val triggerTime = appointmentMillis - (24 * 60 * 60 * 1000) // 24h before

                if (triggerTime <= System.currentTimeMillis()) continue // Already passed

                val intent = Intent(context, ReminderReceiver::class.java).apply {
                    putExtra("citaId", cita.idCita)
                    putExtra("servicio", cita.servicio)
                    putExtra("horaInicio", cita.horaInicio)
                }

                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    cita.idCita.hashCode(),
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            } catch (e: Exception) {
                // Skip invalid dates
            }
        }
    }

    fun cancel(context: Context, citaId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, ReminderReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            citaId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }
}
