package com.barberia.raul.ui.screens.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.barberia.raul.ui.components.CitaCard
import com.barberia.raul.ui.components.LoadingOverlay
import com.barberia.raul.ui.theme.*

@Composable
fun DashboardScreen(
    onCitaClick: (String) -> Unit,
    onLogout: () -> Unit,
    onNavigateToAdmin: () -> Unit,
    viewModel: DashboardViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var tapCount by remember { mutableIntStateOf(0) }
    var lastTapTime by remember { mutableLongStateOf(0L) }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header with welcome + logout
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .weight(1f)
                                .clickable(
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
                            if (uiState.foto.isNotEmpty()) {
                                AsyncImage(
                                    model = uiState.foto,
                                    contentDescription = "Foto de perfil",
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(CircleShape),
                                    contentScale = ContentScale.Crop
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                            }
                            Column {
                                Text(
                                    text = "Hola, ${uiState.nombre.split(" ").firstOrNull() ?: ""}",
                                    style = MaterialTheme.typography.headlineMedium,
                                    color = Blanco
                                )
                            }
                        }
                        IconButton(onClick = {
                            viewModel.logout()
                            onLogout()
                        }) {
                            Icon(
                                Icons.AutoMirrored.Filled.ExitToApp,
                                contentDescription = "Cerrar sesión",
                                tint = Blanco.copy(alpha = 0.6f)
                            )
                        }
                    }
                }

                // Next appointment section
                item {
                    Text(
                        text = "Tu próxima cita",
                        style = MaterialTheme.typography.headlineSmall,
                        color = Azul,
                        fontWeight = FontWeight.Bold
                    )
                }

                item {
                    if (uiState.nextCita != null) {
                        CitaCard(
                            cita = uiState.nextCita!!,
                            onClick = { onCitaClick(uiState.nextCita!!.idCita) }
                        )
                    } else if (!uiState.isLoading) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = GrisOscuro),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "No tienes citas próximas",
                                modifier = Modifier.padding(20.dp),
                                color = Blanco.copy(alpha = 0.5f)
                            )
                        }
                    }
                }

                // All appointments section
                if (uiState.allCitas.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Todas tus citas",
                            style = MaterialTheme.typography.headlineSmall,
                            color = Azul,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    items(uiState.allCitas, key = { it.idCita }) { cita ->
                        CitaCard(
                            cita = cita,
                            onClick = { onCitaClick(cita.idCita) }
                        )
                    }
                }

                // Error
                uiState.error?.let { error ->
                    item {
                        Text(
                            text = error,
                            color = Rojo,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                }
            }

        if (uiState.isLoading) {
            LoadingOverlay()
        }
    }
}
