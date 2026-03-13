package com.barberia.raul

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.rememberNavController
import com.barberia.raul.ui.navigation.BarberiaNavGraph
import com.barberia.raul.ui.navigation.Routes
import com.barberia.raul.ui.theme.BarberiaTheme
import com.barberia.raul.ui.theme.Negro
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

class MainActivity : ComponentActivity() {

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        val app = application as BarberiaApp
        val isLoggedIn = runBlocking { app.userPreferences.isLoggedIn.first() }

        // Request notification permission after login
        if (isLoggedIn) {
            requestNotificationPermission()
        }

        setContent {
            BarberiaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Negro
                ) {
                    val navController = rememberNavController()
                    val startDest = if (isLoggedIn) Routes.Dashboard.route else Routes.Login.route

                    BarberiaNavGraph(
                        navController = navController,
                        startDestination = startDest
                    )
                }
            }
        }
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}
