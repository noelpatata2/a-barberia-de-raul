package com.barberia.raul.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.barberia.raul.ui.screens.dashboard.DashboardScreen
import com.barberia.raul.ui.screens.detail.DetailScreen
import com.barberia.raul.ui.screens.login.LoginScreen

@Composable
fun BarberiaNavGraph(
    navController: NavHostController,
    startDestination: String
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Routes.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.Dashboard.route) {
                        popUpTo(Routes.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.Dashboard.route) {
            DashboardScreen(
                onCitaClick = { citaId ->
                    navController.navigate(Routes.Detail.create(citaId))
                },
                onLogout = {
                    navController.navigate(Routes.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Routes.Detail.route,
            arguments = listOf(navArgument("citaId") { type = NavType.StringType })
        ) { backStackEntry ->
            val citaId = backStackEntry.arguments?.getString("citaId") ?: ""
            DetailScreen(
                citaId = citaId,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
