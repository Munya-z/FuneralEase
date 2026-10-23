package com.funeralease.app.ui.griefjournal

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
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.GriefJournalEntryDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.WarmPaper

private val moods = listOf("Grieving", "Hopeful", "Peaceful", "Anxious")

@Composable
fun GriefJournalScreen(
    viewModel: GriefJournalViewModel = hiltViewModel(),
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
                Text("Grief Journal", style = MaterialTheme.typography.titleLarge, color = WarmPaper)
            }
            Button(
                onClick = { showDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = WarmPaper.copy(alpha = 0.2f)),
                modifier = Modifier.padding(end = 8.dp),
            ) {
                Text("+ Write", color = WarmPaper)
            }
        }

        if (state.error != null) {
            Text(state.error!!, color = Ember, modifier = Modifier.padding(16.dp))
        }

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
            state.entries.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No entries yet. Write your first one.", color = DuskInk.copy(alpha = 0.5f))
            }
            else -> LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                items(state.entries) { entry ->
                    JournalEntryCard(entry = entry, onDelete = { viewModel.delete(entry.id) })
                }
            }
        }
    }

    if (showDialog) {
        WriteEntryDialog(
            onDismiss = { showDialog = false },
            onSave = { content, mood ->
                viewModel.create(content, mood)
                showDialog = false
            },
        )
    }
}

@Composable
private fun JournalEntryCard(entry: GriefJournalEntryDto, onDelete: () -> Unit) {
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
                Text(entry.mood, style = MaterialTheme.typography.labelMedium, color = Candlewick)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        entry.createdAt.take(10),
                        style = MaterialTheme.typography.bodySmall,
                        color = DuskInk.copy(alpha = 0.4f),
                    )
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Filled.Delete, contentDescription = "Delete", tint = Ember.copy(alpha = 0.6f))
                    }
                }
            }
            Text(
                entry.content,
                style = MaterialTheme.typography.bodyMedium,
                color = DuskInk,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
    }
}

@Composable
private fun WriteEntryDialog(onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
    var content by remember { mutableStateOf("") }
    var selectedMood by remember { mutableStateOf("Grieving") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New entry") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("What's on your mind?") },
                    minLines = 4,
                    modifier = Modifier.fillMaxWidth(),
                )
                Text("Mood", style = MaterialTheme.typography.labelMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    moods.forEach { mood ->
                        FilterChip(
                            selected = selectedMood == mood,
                            onClick = { selectedMood = mood },
                            label = { Text(mood, style = MaterialTheme.typography.labelSmall) },
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { if (content.isNotBlank()) onSave(content.trim(), selectedMood) },
                colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
            ) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
