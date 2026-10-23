package com.funeralease.app.ui.vault

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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.PolicyDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.Sage
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun VaultScreen(viewModel: VaultViewModel = hiltViewModel()) {
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
                Text("Vault", style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
                if (!state.loading) {
                    val count = state.policies.size
                    Text(
                        "$count ${if (count == 1) "policy" else "policies"}",
                        style = MaterialTheme.typography.bodySmall,
                        color = WarmPaper.copy(alpha = 0.6f),
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
            }
            Button(
                onClick = { showDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = WarmPaper.copy(alpha = 0.2f)),
            ) {
                Text("+ Add", color = WarmPaper)
            }
        }

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
            state.error != null -> Text(
                state.error!!,
                color = Ember,
                modifier = Modifier.padding(16.dp),
            )
            state.policies.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No policies yet. Add one to get started.", color = DuskInk.copy(alpha = 0.5f))
            }
            else -> LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                items(state.policies) { policy -> PolicyItem(policy) }
            }
        }
    }

    if (showDialog) {
        AddPolicyDialog(
            onDismiss = { showDialog = false },
            onAdd = { insurer, number, premium, due ->
                viewModel.addPolicy(insurer, number, premium, due)
                showDialog = false
            },
        )
    }
}

@Composable
private fun PolicyItem(policy: PolicyDto) {
    val statusColor = when (policy.lapseStatus) {
        "Current" -> Sage
        "Overdue" -> Ember
        else -> Candlewick
    }
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
                Text(policy.insurerName, style = MaterialTheme.typography.titleMedium, color = DuskInk)
                Text(policy.lapseStatus, style = MaterialTheme.typography.labelSmall, color = statusColor)
            }
            Text(
                "Policy: ${policy.policyNumber}",
                style = MaterialTheme.typography.bodySmall,
                color = DuskInk.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 4.dp),
            )
            Text(
                "R${policy.premiumAmount.toLong()} / month  ·  Due: ${policy.nextDueDate.take(10)}",
                style = MaterialTheme.typography.bodySmall,
                color = DuskInk.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 2.dp),
            )
        }
    }
}

@Composable
private fun AddPolicyDialog(onDismiss: () -> Unit, onAdd: (String, String, Double, String) -> Unit) {
    var insurerName by remember { mutableStateOf("") }
    var policyNumber by remember { mutableStateOf("") }
    var premium by remember { mutableStateOf("") }
    var dueDate by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add policy") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(value = insurerName, onValueChange = { insurerName = it },
                    label = { Text("Insurer name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = policyNumber, onValueChange = { policyNumber = it },
                    label = { Text("Policy number") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = premium, onValueChange = { premium = it },
                    label = { Text("Monthly premium (R)") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = dueDate, onValueChange = { dueDate = it },
                    label = { Text("Next due date (YYYY-MM-DD)") }, singleLine = true,
                    modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val p = premium.toDoubleOrNull() ?: return@Button
                    if (insurerName.isNotBlank() && policyNumber.isNotBlank() && dueDate.isNotBlank()) {
                        onAdd(insurerName, policyNumber, p, dueDate)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
            ) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
