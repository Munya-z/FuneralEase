package com.funeralease.app.ui.claims

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.ClaimDto
import com.funeralease.app.data.api.PolicyDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun ClaimsScreen(viewModel: ClaimsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showDialog by remember { mutableStateOf(false) }

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
                Text("Claims", style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
                Text(
                    "Track your insurance claims",
                    style = MaterialTheme.typography.bodySmall,
                    color = WarmPaper.copy(alpha = 0.6f),
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
            Button(
                onClick = { showDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = WarmPaper.copy(alpha = 0.2f)),
            ) {
                Text("+ New", color = WarmPaper)
            }
        }

        if (state.error != null) {
            Text(state.error!!, color = Ember, modifier = Modifier.padding(16.dp))
        }

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
            state.claims.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No claims yet.", color = DuskInk.copy(alpha = 0.5f))
            }
            else -> LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                items(state.claims) { claim -> ClaimItem(claim) }
            }
        }
    }

    if (showDialog) {
        if (state.policies.isEmpty()) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("No policies") },
                text = { Text("Add a policy before opening a claim.") },
                confirmButton = {
                    TextButton(onClick = { showDialog = false }) { Text("OK") }
                },
            )
        } else {
            NewClaimDialog(
                policies = state.policies,
                onDismiss = { showDialog = false },
                onCreate = { policyId, name ->
                    viewModel.createClaim(policyId, name)
                    showDialog = false
                },
            )
        }
    }
}

@Composable
private fun ClaimItem(claim: ClaimDto) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(claim.deceasedFullName, style = MaterialTheme.typography.titleMedium, color = DuskInk)
                Text(claim.status, style = MaterialTheme.typography.labelSmall, color = Candlewick)
            }
            Text(
                "Opened: ${claim.createdAt.take(10)}",
                style = MaterialTheme.typography.bodySmall,
                color = DuskInk.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NewClaimDialog(
    policies: List<PolicyDto>,
    onDismiss: () -> Unit,
    onCreate: (String, String) -> Unit,
) {
    var deceasedName by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf(false) }
    var selectedIndex by remember { mutableIntStateOf(0) }
    val policyLabels = policies.map { "${it.insurerName} – ${it.policyNumber}" }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New claim") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
                    OutlinedTextField(
                        value = policyLabels[selectedIndex],
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Policy") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                    )
                    ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        policyLabels.forEachIndexed { i, label ->
                            DropdownMenuItem(
                                text = { Text(label) },
                                onClick = { selectedIndex = i; expanded = false },
                            )
                        }
                    }
                }
                OutlinedTextField(
                    value = deceasedName,
                    onValueChange = { deceasedName = it },
                    label = { Text("Deceased full name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (deceasedName.isNotBlank()) onCreate(policies[selectedIndex].id, deceasedName.trim())
                },
                colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
            ) { Text("Open") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
