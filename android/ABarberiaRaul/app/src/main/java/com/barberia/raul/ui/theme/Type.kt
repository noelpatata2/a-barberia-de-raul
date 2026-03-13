package com.barberia.raul.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val BarberiaTypography = Typography(
    headlineLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 28.sp, color = Blanco),
    headlineMedium = TextStyle(fontWeight = FontWeight.Bold, fontSize = 22.sp, color = Blanco),
    headlineSmall = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 18.sp, color = Blanco),
    bodyLarge = TextStyle(fontSize = 16.sp, color = Blanco),
    bodyMedium = TextStyle(fontSize = 14.sp, color = Blanco),
    bodySmall = TextStyle(fontSize = 12.sp, color = Blanco.copy(alpha = 0.7f)),
    labelLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = Blanco),
    labelMedium = TextStyle(fontSize = 12.sp, color = Blanco.copy(alpha = 0.7f))
)
