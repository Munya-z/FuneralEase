package com.funeralease.app.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavBackStackEntry
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import com.funeralease.app.ui.auth.AuthGateScreen
import com.funeralease.app.ui.auth.NameScreen
import com.funeralease.app.ui.auth.OnboardingScreen
import com.funeralease.app.ui.auth.OtpScreen
import com.funeralease.app.ui.auth.PinLoginScreen
import com.funeralease.app.ui.auth.PinScreen
import com.funeralease.app.ui.auth.RegisterScreen
import com.funeralease.app.ui.burialsociety.BurialSocietyScreen
import com.funeralease.app.ui.claims.ClaimsScreen
import com.funeralease.app.ui.digitalvault.DigitalVaultScreen
import com.funeralease.app.ui.family.FamilyScreen
import com.funeralease.app.ui.griefjournal.GriefJournalScreen
import com.funeralease.app.ui.home.HomeScreen
import com.funeralease.app.ui.more.MoreScreen
import com.funeralease.app.ui.notifications.NotificationsScreen
import com.funeralease.app.ui.parlours.ParloursScreen
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.WarmPaper
import com.funeralease.app.ui.upgrade.UpgradeScreen
import com.funeralease.app.ui.vault.VaultScreen
import com.funeralease.app.ui.wishes.WishesScreen

private data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: ImageVector,
)

private val bottomNavItems = listOf(
    BottomNavItem("home", "Home", Icons.Filled.Home),
    BottomNavItem("vault", "Vault", Icons.Filled.Lock),
    BottomNavItem("claims", "Claims", Icons.Filled.Description),
    BottomNavItem("family", "Family", Icons.Filled.People),
    BottomNavItem("more", "More", Icons.Filled.MoreHoriz),
)

private val bottomNavRoutes = bottomNavItems.map { it.route }.toSet()

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            if (currentRoute in bottomNavRoutes) {
                NavigationBar(
                    containerColor = DuskInk,
                ) {
                    bottomNavItems.forEach { item ->
                        NavigationBarItem(
                            selected = currentRoute == item.route,
                            onClick = {
                                navController.navigate(item.route) {
                                    launchSingleTop = true
                                    restoreState = true
                                    popUpTo("home") { saveState = true }
                                }
                            },
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = {
                                Text(item.label, style = MaterialTheme.typography.labelSmall)
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = DuskInk,
                                selectedTextColor = WarmPaper,
                                indicatorColor = WarmPaper,
                                unselectedIconColor = WarmPaper.copy(alpha = 0.6f),
                                unselectedTextColor = WarmPaper.copy(alpha = 0.6f),
                            ),
                        )
                    }
                }
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "auth_graph",
            modifier = Modifier.padding(innerPadding),
        ) {
            navigation(startDestination = "gate", route = "auth_graph") {
                composable("gate") { backStackEntry ->
                    val authEntry = remember(backStackEntry) {
                        navController.getBackStackEntry("auth_graph")
                    }
                    AuthGateScreen(
                        authEntry = authEntry,
                        onHasSavedSession = {
                            navController.navigate("pin_login") {
                                popUpTo("gate") { inclusive = true }
                            }
                        },
                        onNoSavedSession = {
                            navController.navigate("onboarding") {
                                popUpTo("gate") { inclusive = true }
                            }
                        },
                    )
                }
                composable("pin_login") { backStackEntry ->
                    val authEntry = remember(backStackEntry) {
                        navController.getBackStackEntry("auth_graph")
                    }
                    PinLoginScreen(
                        authEntry = authEntry,
                        onLoggedIn = {
                            navController.navigate("home") {
                                popUpTo("auth_graph") { inclusive = true }
                            }
                        },
                        onUseOtp = {
                            navController.navigate("onboarding") {
                                popUpTo("pin_login") { inclusive = true }
                            }
                        },
                    )
                }
                composable("onboarding") { backStackEntry ->
                    val authEntry = remember(backStackEntry) {
                        navController.getBackStackEntry("auth_graph")
                    }
                    OnboardingScreen(
                        authEntry = authEntry,
                        onOtpSent = { navController.navigate("otp") },
                        onRegister = { navController.navigate("register") },
                    )
                }
                composable("register") { backStackEntry ->
                    val authEntry = remember(backStackEntry) {
                        navController.getBackStackEntry("auth_graph")
                    }
                    RegisterScreen(
                        authEntry = authEntry,
                        onOtpSent = { navController.navigate("otp") },
                        onBack = { navController.popBackStack() },
                    )
                }
                composable("otp") { backStackEntry ->
                    val authEntry = remember(backStackEntry) {
                        navController.getBackStackEntry("auth_graph")
                    }
                    OtpScreen(
                        authEntry = authEntry,
                        onNeedsName = { navController.navigate("name") },
                        onLoggedIn = {
                            navController.navigate("home") {
                                popUpTo("auth_graph") { inclusive = true }
                            }
                        },
                        onBack = { navController.popBackStack() },
                    )
                }
                composable("name") { backStackEntry ->
                    val authEntry = remember(backStackEntry) {
                        navController.getBackStackEntry("auth_graph")
                    }
                    NameScreen(
                        authEntry = authEntry,
                        onVerified = { navController.navigate("pin") },
                    )
                }
                composable("pin") { backStackEntry ->
                    val authEntry = remember(backStackEntry) {
                        navController.getBackStackEntry("auth_graph")
                    }
                    PinScreen(
                        authEntry = authEntry,
                        onDone = {
                            navController.navigate("home") {
                                popUpTo("auth_graph") { inclusive = true }
                            }
                        },
                    )
                }
            }

            composable("home") { HomeScreen() }
            composable("vault") { VaultScreen() }
            composable("claims") { ClaimsScreen() }
            composable("family") { FamilyScreen() }
            composable("more") {
                MoreScreen(
                    onNavigateToWishes = { navController.navigate("wishes") },
                    onNavigateToBurialSociety = { navController.navigate("burial_society") },
                    onNavigateToDigitalVault = { navController.navigate("digital_vault") },
                    onNavigateToGriefJournal = { navController.navigate("grief_journal") },
                    onNavigateToParlours = { navController.navigate("parlours") },
                    onNavigateToNotifications = { navController.navigate("notifications") },
                    onNavigateToUpgrade = { navController.navigate("upgrade") },
                    onLogout = {
                        navController.navigate("auth_graph") {
                            popUpTo("home") { inclusive = true }
                        }
                    },
                )
            }
            composable("wishes") { WishesScreen(onBack = { navController.popBackStack() }) }
            composable("burial_society") {
                BurialSocietyScreen(onBack = { navController.popBackStack() })
            }
            composable("digital_vault") {
                DigitalVaultScreen(onBack = { navController.popBackStack() })
            }
            composable("grief_journal") {
                GriefJournalScreen(onBack = { navController.popBackStack() })
            }
            composable("parlours") { ParloursScreen(onBack = { navController.popBackStack() }) }
            composable("notifications") {
                NotificationsScreen(onBack = { navController.popBackStack() })
            }
            composable("upgrade") { UpgradeScreen(onBack = { navController.popBackStack() }) }
        }
    }
}
