package com.barberia.raul.ui.components

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import com.barberia.raul.ui.theme.*

@Composable
fun ConfirmDialog(
    title: String,
    message: String,
    confirmText: String = "Confirmar",
    dismissText: String = "Cancelar",
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title, color = Blanco) },
        text = { Text(message, color = Blanco.copy(alpha = 0.8f)) },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text(confirmText, color = Azul)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(dismissText, color = Blanco.copy(alpha = 0.5f))
            }
        },
        containerColor = GrisOscuro,
        titleContentColor = Blanco,
        textContentColor = Blanco
    )
}
