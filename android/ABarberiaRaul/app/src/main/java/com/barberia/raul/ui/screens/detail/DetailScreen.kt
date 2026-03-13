package com.barberia.raul.ui.screens.detail

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.barberia.raul.ui.components.*
import com.barberia.raul.ui.theme.*

@Composable
fun DetailScreen(
    citaId: String,
    onBack: () -> Unit,
    viewModel: DetailViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showCancelDialog by remember { mutableStateOf(false) }
    var cancelMotivo by remember { mutableStateOf("") }

    LaunchedEffect(citaId) {
        viewModel.loadCita(citaId)
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            // Back button
            IconButton(onClick = onBack) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Volver",
                    tint = Blanco
                )
            }

            uiState.cita?.let { cita ->
                Spacer(modifier = Modifier.height(16.dp))

                // Service name
                Text(
                    text = cita.servicio,
                    style = MaterialTheme.typography.headlineLarge,
                    color = Azul,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(12.dp))
                StatusBadge(estado = cita.estado)

                Spacer(modifier = Modifier.height(32.dp))

                // Detail rows
                Card(
                    colors = CardDefaults.cardColors(containerColor = GrisOscuro),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        DetailRow("Fecha", formatDate(cita.fecha))
                        HorizontalDivider(color = Gris, modifier = Modifier.padding(vertical = 12.dp))
                        DetailRow("Hora", "${cita.horaInicio}${if (cita.horaFin.isNotEmpty()) " - ${cita.horaFin}" else ""}")
                        HorizontalDivider(color = Gris, modifier = Modifier.padding(vertical = 12.dp))
                        DetailRow("Servicio", cita.servicio)
                        HorizontalDivider(color = Gris, modifier = Modifier.padding(vertical = 12.dp))
                        DetailRow("Estado", cita.estado)
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Cancel button (only if Confirmada)
                if (cita.estado.contains("Confirmada", true)) {
                    Button(
                        onClick = { showCancelDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Rojo)
                    ) {
                        Text("Solicitar Cancelación", fontWeight = FontWeight.Bold)
                    }
                }

                // Success message
                if (uiState.cancelSuccess) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Solicitud de cancelación enviada",
                        color = Verde,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }

        // Cancel confirmation dialog
        if (showCancelDialog) {
            AlertDialog(
                onDismissRequest = { showCancelDialog = false },
                title = { Text("Solicitar Cancelación", color = Blanco) },
                text = {
                    Column {
                        Text("¿Estás seguro de que quieres cancelar esta cita?", color = Blanco.copy(alpha = 0.8f))
                        Spacer(modifier = Modifier.height(16.dp))
                        OutlinedTextField(
                            value = cancelMotivo,
                            onValueChange = { cancelMotivo = it },
                            label = { Text("Motivo (opcional)") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Azul,
                                unfocusedBorderColor = Gris,
                                focusedLabelColor = Azul,
                                cursorColor = Azul,
                                focusedTextColor = Blanco,
                                unfocusedTextColor = Blanco
                            )
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        showCancelDialog = false
                        viewModel.cancelarCita(cancelMotivo)
                    }) {
                        Text("Confirmar", color = Rojo)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showCancelDialog = false }) {
                        Text("Volver", color = Blanco.copy(alpha = 0.5f))
                    }
                },
                containerColor = GrisOscuro
            )
        }

        if (uiState.isCancelling) {
            LoadingOverlay()
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = Blanco.copy(alpha = 0.6f), style = MaterialTheme.typography.bodyMedium)
        Text(text = value, color = Blanco, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
    }
}

private fun formatDate(dateStr: String): String {
    return try {
        val parts = dateStr.split("-")
        if (parts.size == 3) "${parts[2]}/${parts[1]}/${parts[0]}" else dateStr
    } catch (e: Exception) { dateStr }
}
