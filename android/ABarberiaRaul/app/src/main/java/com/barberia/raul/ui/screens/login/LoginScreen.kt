package com.barberia.raul.ui.screens.login

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.barberia.raul.ui.components.GoldButton
import com.barberia.raul.ui.components.LoadingOverlay
import com.barberia.raul.ui.theme.*

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToAdmin: () -> Unit,
    viewModel: LoginViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var tapCount by remember { mutableIntStateOf(0) }
    var lastTapTime by remember { mutableLongStateOf(0L) }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Logo section with triple-tap for admin
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() }
                ) {
                    val now = System.currentTimeMillis()
                    if (now - lastTapTime > 1000) tapCount = 0
                    tapCount++
                    lastTapTime = now
                    if (tapCount >= 3) {
                        tapCount = 0
                        onNavigateToAdmin()
                    }
                }
            ) {
                Text(
                    text = "✂\uFE0F",
                    fontSize = 64.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "A Barbería\nde Raúl",
                    style = MaterialTheme.typography.headlineLarge,
                    color = Azul,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    lineHeight = 36.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Gestiona tus citas",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Blanco.copy(alpha = 0.6f)
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            GoldButton(
                text = "Iniciar sesión con Google",
                onClick = { viewModel.signInWithGoogle(context, onLoginSuccess) },
                enabled = !uiState.isLoading
            )

            // Error message
            uiState.error?.let { error ->
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = error,
                    color = Rojo,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center
                )
            }
        }

        if (uiState.isLoading) {
            LoadingOverlay()
        }
    }
}
