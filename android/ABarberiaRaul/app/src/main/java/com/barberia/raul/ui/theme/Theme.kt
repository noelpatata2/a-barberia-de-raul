package com.barberia.raul.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = Azul,
    onPrimary = Blanco,
    primaryContainer = Azul,
    onPrimaryContainer = Blanco,
    secondary = AzulClaro,
    onSecondary = Negro,
    background = Negro,
    onBackground = Blanco,
    surface = GrisOscuro,
    onSurface = Blanco,
    surfaceVariant = Gris,
    onSurfaceVariant = Blanco.copy(alpha = 0.7f),
    error = Rojo,
    onError = Blanco
)

@Composable
fun BarberiaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = BarberiaTypography,
        content = content
    )
}
