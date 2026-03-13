package com.barberia.raul.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.barberia.raul.ui.theme.*

@Composable
fun StatusBadge(estado: String, modifier: Modifier = Modifier) {
    val (bgColor, textColor) = when {
        estado.contains("Confirmada", true) -> Verde.copy(alpha = 0.15f) to Verde
        estado.contains("Cancelada", true) && !estado.contains("Pendiente", true) -> Rojo.copy(alpha = 0.15f) to Rojo
        estado.contains("Pendiente", true) -> Amarillo.copy(alpha = 0.15f) to Amarillo
        else -> Gris to Blanco
    }

    Text(
        text = estado,
        color = textColor,
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .padding(horizontal = 12.dp, vertical = 4.dp)
    )
}
