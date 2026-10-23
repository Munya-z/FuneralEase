package com.funeralease.app.ui.digitalvault

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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
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
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.funeralease.app.data.api.DigitalAssetDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.WarmPaper

private val categories = listOf("SocialMedia", "Banking", "Email", "Subscription", "Other")

@Composable
fun DigitalVaultScreen(
    viewModel: DigitalVaultViewModel = hiltViewModel(),
    onBack: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showDialog by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().background(WarmPaper)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DuskInk)
                .padding(horizontal = 8.dp, vertical = 12.dp)
                .padding(top = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = WarmPaper)
                }
                Text("Digital Vault", style = MaterialTheme.typography.titleLarge, color = WarmPaper)
            }
            Button(
                onClick = { showDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = WarmPaper.copy(alpha = 0.2f)),
                modifier = Modifier.padding(end = 8.dp),
            ) {
                Text("+ Add", color = WarmPaper)
            }
        }

        if (state.error != null) {
            Text(state.error!!, color = Ember, modifier = Modifier.padding(16.dp))
        }

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
            state.assets.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No digital assets stored yet.", color = DuskInk.copy(alpha = 0.5f))
            }
            else -> LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                items(state.assets) { asset ->
                    AssetCard(asset = asset, onDelete = { viewModel.delete(asset.id) })
                }
            }
        }
    }

    if (showDialog) {
        AddAssetDialog(
            onDismiss = { showDialog = false },
            onAdd = { category, service, username, notes, url, onDeath ->
                viewModel.create(category, service, username, notes, url, onDeath)
                showDialog = false
            },
        )
    }
}

@Composable
private fun AssetCard(asset: DigitalAssetDto, onDelete: () -> Unit) {
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(asset.serviceName, style = MaterialTheme.typography.titleMedium, color = DuskInk)
                    Text(
                        asset.category,
                        style = MaterialTheme.typography.labelSmall,
                        color = Candlewick,
                        modifier = Modifier.padding(top = 2.dp),
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, contentDescription = "Delete", tint = Ember.copy(alpha = 0.6f))
                }
            }
            if (!asset.username.isNullOrBlank()) {
                Text(
                    "Username: ${asset.username}",
                    style = MaterialTheme.typography.bodySmall,
                    color = DuskInk.copy(alpha = 0.6f),
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
            Text(
                "On death: ${asset.onDeathInstruction}",
                style = MaterialTheme.typography.bodySmall,
                color = DuskInk.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 2.dp),
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddAssetDialog(
    onDismiss: () -> Unit,
    onAdd: (String, String, String?, String?, String?, String) -> Unit,
) {
    var serviceName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var url by remember { mutableStateOf("") }
    var onDeath by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf(false) }
    var selectedIndex by remember { mutableIntStateOf(0) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add digital asset") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
                    OutlinedTextField(
                        value = categories[selectedIndex],
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Category") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                    )
                    ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        categories.forEachIndexed { i, cat ->
                            DropdownMenuItem(text = { Text(cat) }, onClick = { selectedIndex = i; expanded = false })
                        }
                    }
                }
                OutlinedTextField(value = serviceName, onValueChange = { serviceName = it },
                    label = { Text("Service name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = username, onValueChange = { username = it },
                    label = { Text("Username (optional)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = url, onValueChange = { url = it },
                    label = { Text("URL (optional)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = notes, onValueChange = { notes = it },
                    label = { Text("Notes (optional)") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = onDeath, onValueChange = { onDeath = it },
                    label = { Text("On death instruction") }, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (serviceName.isNotBlank() && onDeath.isNotBlank()) {
                        onAdd(
                            categories[selectedIndex],
                            serviceName.trim(),
                            username.trim().ifBlank { null },
                            notes.trim().ifBlank { null },
                            url.trim().ifBlank { null },
                            onDeath.trim(),
                        )
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
            ) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
