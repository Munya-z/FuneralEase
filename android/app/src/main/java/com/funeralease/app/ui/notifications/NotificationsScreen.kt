package com.funeralease.app.ui.notifications

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.NotificationSettingsDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.Sage
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun NotificationsScreen(
    viewModel: NotificationsViewModel = hiltViewModel(),
    onBack: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    var premiumDue by remember { mutableStateOf(false) }
    var premiumOverdue by remember { mutableStateOf(false) }
    var lapseWarning by remember { mutableStateOf(false) }
    var claimUpdates by remember { mutableStateOf(false) }
    var emergencyAccess by remember { mutableStateOf(false) }
    var referralJoins by remember { mutableStateOf(false) }

    LaunchedEffect(state.settings) {
        state.settings?.let { s ->
            premiumDue = s.premiumDue
            premiumOverdue = s.premiumOverdue
            lapseWarning = s.lapseWarning
            claimUpdates = s.claimUpdates
            emergencyAccess = s.emergencyAccess
            referralJoins = s.referralJoins
        }
    }

    Column(modifier = Modifier.fillMaxSize().background(WarmPaper)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DuskInk)
                .padding(horizontal = 8.dp, vertical = 12.dp)
                .padding(top = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = WarmPaper)
            }
            Text("Notifications", style = MaterialTheme.typography.titleLarge, color = WarmPaper)
        }

        if (state.loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (state.saved) {
                    Text("Settings saved.", color = Sage, style = MaterialTheme.typography.bodySmall)
                }
                if (state.error != null) {
                    Text(state.error!!, color = Ember, style = MaterialTheme.typography.bodySmall)
                }

                SettingRow("Premium due reminders", premiumDue) { premiumDue = it }
                SettingRow("Premium overdue alerts", premiumOverdue) { premiumOverdue = it }
                SettingRow("Lapse warnings", lapseWarning) { lapseWarning = it }
                SettingRow("Claim updates", claimUpdates) { claimUpdates = it }
                SettingRow("Emergency access events", emergencyAccess) { emergencyAccess = it }
                SettingRow("Referral join notifications", referralJoins) { referralJoins = it }

                Button(
                    onClick = {
                        viewModel.save(
                            NotificationSettingsDto(
                                premiumDue = premiumDue,
                                premiumOverdue = premiumOverdue,
                                lapseWarning = lapseWarning,
                                claimUpdates = claimUpdates,
                                emergencyAccess = emergencyAccess,
                                referralJoins = referralJoins,
                            )
                        )
                    },
                    enabled = !state.saving,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
                ) { Text("Save") }
            }
        }
    }
}

@Composable
private fun SettingRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = DuskInk)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedThumbColor = WarmPaper, checkedTrackColor = Candlewick),
        )
    }
}
