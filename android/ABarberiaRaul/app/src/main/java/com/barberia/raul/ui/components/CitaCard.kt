package com.barberia.raul.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.barberia.raul.data.model.Cita
import com.barberia.raul.ui.theme.*

@Composable
fun CitaCard(
    cita: Cita,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = GrisOscuro),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = cita.servicio,
                    style = MaterialTheme.typography.headlineSmall,
                    color = Azul
                )
                StatusBadge(estado = cita.estado)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = formatDate(cita.fecha),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Blanco.copy(alpha = 0.7f)
                )
                Text(
                    text = cita.horaInicio,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Blanco.copy(alpha = 0.7f)
                )
            }
        }
    }
}

fun formatDate(dateStr: String): String {
    return try {
        val parts = dateStr.split("-")
        if (parts.size == 3) "${parts[2]}/${parts[1]}/${parts[0]}" else dateStr
    } catch (e: Exception) {
        dateStr
    }
}
