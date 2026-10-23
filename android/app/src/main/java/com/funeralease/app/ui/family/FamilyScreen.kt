package com.funeralease.app.ui.family

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
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.AccessGrantDto
import com.funeralease.app.data.api.EmergencyContactDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.Sage
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun FamilyScreen(viewModel: FamilyViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showAddMemberDialog by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().background(WarmPaper)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DuskInk)
                .padding(horizontal = 20.dp, vertical = 20.dp)
                .padding(top = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text("Family", style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
                Text(
                    "Household members & emergency access",
                    style = MaterialTheme.typography.bodySmall,
                    color = WarmPaper.copy(alpha = 0.6f),
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
            Button(
                onClick = { showAddMemberDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = WarmPaper.copy(alpha = 0.2f)),
            ) {
                Text("+ Add", color = WarmPaper)
            }
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
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                if (state.error != null) {
                    Text(state.error!!, color = Ember)
                }

                // Household members
                Text(
                    "Household members",
                    style = MaterialTheme.typography.titleMedium,
                    color = DuskInk,
                )
                if (state.members.isEmpty()) {
                    Text("No members added yet.", color = DuskInk.copy(alpha = 0.5f))
                } else {
                    state.members.forEach { member ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(member.fullName, style = MaterialTheme.typography.bodyMedium, color = DuskInk)
                                Text(
                                    "${member.mobileNumber}  ·  ${member.role}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DuskInk.copy(alpha = 0.6f),
                                    modifier = Modifier.padding(top = 2.dp),
                                )
                            }
                        }
                    }
                }

                HorizontalDivider()

                // Emergency contacts
                Text(
                    "Emergency contacts",
                    style = MaterialTheme.typography.titleMedium,
                    color = DuskInk,
                )

                val contacts = state.session?.contacts ?: emptyList()
                val grants = state.session?.activeGrants ?: emptyList()
                val grantedIds = grants.map { it.contactId }.toSet()

                if (contacts.isEmpty()) {
                    Text("No emergency contacts configured.", color = DuskInk.copy(alpha = 0.5f))
                } else {
                    contacts.forEach { contact ->
                        val hasGrant = contact.id in grantedIds
                        val grant = grants.firstOrNull { it.contactId == contact.id }
                        EmergencyContactCard(
                            contact = contact,
                            hasGrant = hasGrant,
                            onToggleGrant = {
                                if (hasGrant && grant != null) viewModel.revokeGrant(grant.id)
                                else viewModel.requestGrant(contact.id)
                            },
                        )
                    }
                }
            }
        }
    }

    if (showAddMemberDialog) {
        AddMemberDialog(
            onDismiss = { showAddMemberDialog = false },
            onAdd = { name, mobile ->
                viewModel.addMember(name, mobile)
                showAddMemberDialog = false
            },
        )
    }
}

@Composable
private fun EmergencyContactCard(
    contact: EmergencyContactDto,
    hasGrant: Boolean,
    onToggleGrant: () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(contact.fullName, style = MaterialTheme.typography.bodyMedium, color = DuskInk)
                Text(
                    "${contact.relationship}  ·  ${contact.mobileNumber}",
                    style = MaterialTheme.typography.bodySmall,
                    color = DuskInk.copy(alpha = 0.6f),
                    modifier = Modifier.padding(top = 2.dp),
                )
            }
            OutlinedButton(
                onClick = onToggleGrant,
                modifier = Modifier.padding(start = 8.dp),
            ) {
                Text(
                    if (hasGrant) "Revoke" else "Grant",
                    color = if (hasGrant) Ember else Sage,
                    style = MaterialTheme.typography.labelSmall,
                )
            }
        }
    }
}

@Composable
private fun AddMemberDialog(onDismiss: () -> Unit, onAdd: (String, String) -> Unit) {
    var fullName by remember { mutableStateOf("") }
    var mobile by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add household member") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(value = fullName, onValueChange = { fullName = it },
                    label = { Text("Full name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = mobile, onValueChange = { mobile = it },
                    label = { Text("Mobile number") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                onClick = { if (fullName.isNotBlank() && mobile.isNotBlank()) onAdd(fullName.trim(), mobile.trim()) },
                colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
            ) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
