package com.barberia.raul.ui.navigation

sealed class Routes(val route: String) {
    data object Login : Routes("login")
    data object Dashboard : Routes("dashboard")
    data object Detail : Routes("detail/{citaId}") {
        fun create(citaId: String) = "detail/$citaId"
    }
    data object Admin : Routes("admin")
}
