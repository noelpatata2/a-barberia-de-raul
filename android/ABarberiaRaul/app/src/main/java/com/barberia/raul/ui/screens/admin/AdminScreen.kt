package com.barberia.raul.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.barberia.raul.ui.components.*
import com.barberia.raul.ui.theme.*

@Composable
fun AdminScreen(
    onBack: () -> Unit,
    viewModel: AdminViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Box(modifier = Modifier.fillMaxSize()) {
        if (!uiState.isLoggedIn) {
            // Admin login form
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.align(Alignment.Start)
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver", tint = Blanco)
                }

                Spacer(modifier = Modifier.height(32.dp))

                Text(
                    text = "Panel de Raúl",
                    style = MaterialTheme.typography.headlineLarge,
                    color = Azul
                )

                Spacer(modifier = Modifier.height(32.dp))

                OutlinedTextField(
                    value = uiState.password,
                    onValueChange = { viewModel.updatePassword(it) },
                    label = { Text("Contraseña") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Azul,
                        unfocusedBorderColor = Gris,
                        focusedLabelColor = Azul,
                        cursorColor = Azul,
                        focusedTextColor = Blanco,
                        unfocusedTextColor = Blanco
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                GoldButton(
                    text = "Entrar",
                    onClick = { viewModel.login() },
                    enabled = uiState.password.isNotEmpty() && !uiState.isLoading
                )

                uiState.loginError?.let { error ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = error, color = Rojo)
                }
            }
        } else {
            // Admin dashboard
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = onBack) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver", tint = Blanco)
                            }
                            Text("Panel de Raúl", style = MaterialTheme.typography.headlineMedium, color = Azul)
                        }
                        IconButton(onClick = { viewModel.logout() }) {
                            Icon(Icons.AutoMirrored.Filled.ExitToApp, "Cerrar sesión", tint = Blanco.copy(alpha = 0.6f))
                        }
                    }
                }

                // Stats cards
                uiState.dashboard?.estadisticas?.let { stats ->
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            StatCard("Hoy", stats.totalCitasHoy.toString(), Azul, Modifier.weight(1f))
                            StatCard("Activas", stats.citasActivas.toString(), Verde, Modifier.weight(1f))
                            StatCard("Pendientes", stats.solicitudesPendientes.toString(), Amarillo, Modifier.weight(1f))
                        }
                    }
                }

                // Today's appointments
                item {
                    Text("Citas de hoy", style = MaterialTheme.typography.headlineSmall, color = Azul, fontWeight = FontWeight.Bold)
                }

                val citasHoy = uiState.dashboard?.citasHoy ?: emptyList()
                if (citasHoy.isEmpty()) {
                    item {
                        Text("No hay citas para hoy", color = Blanco.copy(alpha = 0.5f))
                    }
                } else {
                    items(citasHoy) { cita ->
                        CitaCard(cita = cita, onClick = {})
                    }
                }

                // Cancellation requests
                val solicitudes = uiState.dashboard?.solicitudesPendientes ?: emptyList()
                if (solicitudes.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Solicitudes de cancelación", style = MaterialTheme.typography.headlineSmall, color = Amarillo, fontWeight = FontWeight.Bold)
                    }

                    items(solicitudes) { solicitud ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = GrisOscuro),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(solicitud.cliente, color = Blanco, fontWeight = FontWeight.SemiBold)
                                Text("${solicitud.servicio} — ${solicitud.fechaCita}", color = Blanco.copy(alpha = 0.7f))
                                if (solicitud.motivo.isNotEmpty()) {
                                    Text("Motivo: ${solicitud.motivo}", color = Blanco.copy(alpha = 0.5f), style = MaterialTheme.typography.bodySmall)
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Button(
                                        onClick = { viewModel.procesarSolicitud(solicitud.idSolicitud, "Aprobada") },
                                        colors = ButtonDefaults.buttonColors(containerColor = Verde),
                                        modifier = Modifier.weight(1f),
                                        shape = RoundedCornerShape(8.dp)
                                    ) { Text("Aprobar") }
                                    Button(
                                        onClick = { viewModel.procesarSolicitud(solicitud.idSolicitud, "Rechazada") },
                                        colors = ButtonDefaults.buttonColors(containerColor = Rojo),
                                        modifier = Modifier.weight(1f),
                                        shape = RoundedCornerShape(8.dp)
                                    ) { Text("Rechazar") }
                                }
                            }
                        }
                    }
                }

                uiState.actionMessage?.let { msg ->
                    item { Text(msg, color = Verde) }
                }
            }
        }

        if (uiState.isLoading) {
            LoadingOverlay()
        }
    }
}

@Composable
private fun StatCard(label: String, value: String, color: androidx.compose.ui.graphics.Color, modifier: Modifier = Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = GrisOscuro),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, style = MaterialTheme.typography.headlineMedium, color = color, fontWeight = FontWeight.Bold)
            Text(label, style = MaterialTheme.typography.bodySmall, color = Blanco.copy(alpha = 0.6f))
        }
    }
}
