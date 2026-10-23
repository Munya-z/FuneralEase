package com.funeralease.app.ui.more

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun MoreScreen(
    viewModel: MoreViewModel = hiltViewModel(),
    onNavigateToWishes: () -> Unit,
    onNavigateToBurialSociety: () -> Unit,
    onNavigateToDigitalVault: () -> Unit,
    onNavigateToGriefJournal: () -> Unit,
    onNavigateToParlours: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToUpgrade: () -> Unit,
    onLogout: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    var showLogoutDialog by remember { mutableStateOf(false) }

    LaunchedEffect(state.loggedOut) {
        if (state.loggedOut) onLogout()
    }

    Column(modifier = Modifier.fillMaxSize().background(WarmPaper)) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(DuskInk)
                .padding(horizontal = 20.dp, vertical = 20.dp)
                .padding(top = 20.dp),
        ) {
            Text("More", style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
            val sub = state.subscription
            if (sub != null) {
                val tierLabel = sub.tier.replaceFirstChar { it.uppercaseChar() }
                val trialNote = if (sub.isInTrial) " · Trial" else ""
                Text(
                    "$tierLabel plan$trialNote",
                    style = MaterialTheme.typography.bodySmall,
                    color = Candlewick,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            // Referral card
            val ref = state.referral
            if (ref != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Candlewick.copy(alpha = 0.1f)),
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Referral", style = MaterialTheme.typography.titleSmall, color = DuskInk)
                        Text(
                            "Your code: ${ref.referralCode}  ·  ${ref.conversionsCount} referrals",
                            style = MaterialTheme.typography.bodySmall,
                            color = DuskInk.copy(alpha = 0.7f),
                            modifier = Modifier.padding(top = 4.dp),
                        )
                        TextButton(
                            onClick = {
                                val intent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_TEXT, "Join me on FuneralEase: ${ref.referralLink}")
                                }
                                context.startActivity(Intent.createChooser(intent, "Share via"))
                            },
                        ) { Text("Share referral link", color = Candlewick) }
                    }
                }
            }

            HorizontalDivider()
            Text("Services", style = MaterialTheme.typography.labelMedium, color = DuskInk.copy(alpha = 0.5f))

            MoreItem("Funeral Wishes", onClick = onNavigateToWishes)
            MoreItem("Burial Society", onClick = onNavigateToBurialSociety)
            MoreItem("Digital Vault", onClick = onNavigateToDigitalVault)
            MoreItem("Grief Journal", onClick = onNavigateToGriefJournal)
            MoreItem("Find Parlours", onClick = onNavigateToParlours)

            HorizontalDivider()
            Text("Account", style = MaterialTheme.typography.labelMedium, color = DuskInk.copy(alpha = 0.5f))

            MoreItem("Notifications", onClick = onNavigateToNotifications)
            MoreItem("Upgrade plan", onClick = onNavigateToUpgrade)

            HorizontalDivider()

            Card(
                onClick = { showLogoutDialog = true },
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Ember.copy(alpha = 0.08f)),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = null,
                            tint = Ember,
                        )
                        Text("Sign out", style = MaterialTheme.typography.bodyMedium, color = Ember)
                    }
                }
            }
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Sign out") },
            text = { Text("Are you sure you want to sign out?") },
            confirmButton = {
                TextButton(onClick = { viewModel.logout(); showLogoutDialog = false }) {
                    Text("Sign out", color = Ember)
                }
            },
            dismissButton = { TextButton(onClick = { showLogoutDialog = false }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun MoreItem(title: String, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(title, style = MaterialTheme.typography.bodyMedium, color = DuskInk)
            Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = DuskInk.copy(alpha = 0.4f))
        }
    }
}
