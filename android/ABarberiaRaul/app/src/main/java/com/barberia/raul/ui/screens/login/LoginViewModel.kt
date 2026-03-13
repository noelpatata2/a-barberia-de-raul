package com.barberia.raul.ui.screens.login

import android.app.Application
import androidx.credentials.*
import androidx.credentials.exceptions.*
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.barberia.raul.BarberiaApp
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class LoginUiState(
    val isLoading: Boolean = false,
    val error: String? = null
)

class LoginViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as BarberiaApp
    private val repository = app.repository

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun signInWithGoogle(context: android.content.Context, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val credentialManager = CredentialManager.create(context)
                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId("253527395479-lfd1qfkto0f2lrku336hn6ics468olbr.apps.googleusercontent.com")
                    .build()

                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                val result = credentialManager.getCredential(context, request)
                val credential = result.credential

                if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    val idToken = googleIdTokenCredential.idToken

                    repository.getCliente(idToken).fold(
                        onSuccess = {
                            _uiState.update { it.copy(isLoading = false) }
                            onSuccess()
                        },
                        onFailure = { e ->
                            _uiState.update { it.copy(isLoading = false, error = e.message) }
                        }
                    )
                } else {
                    _uiState.update { it.copy(isLoading = false, error = "Error de autenticación") }
                }
            } catch (e: GetCredentialCancellationException) {
                _uiState.update { it.copy(isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message ?: "Error al iniciar sesión") }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
