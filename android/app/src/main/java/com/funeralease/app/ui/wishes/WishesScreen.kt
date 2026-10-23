package com.funeralease.app.ui.wishes

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
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.WishesDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.Sage
import com.funeralease.app.ui.theme.WarmPaper

private val burialTypes = listOf("Traditional burial", "Cremation", "Green burial", "Mausoleum", "Other")
private val ceremonyTypes = listOf("Religious", "Civil", "Military", "Private", "Memorial only", "Other")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishesScreen(
    viewModel: WishesViewModel = hiltViewModel(),
    onBack: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    var burialIndex by remember { mutableIntStateOf(0) }
    var ceremonyIndex by remember { mutableIntStateOf(0) }
    var music by remember { mutableStateOf("") }
    var readings by remember { mutableStateOf("") }
    var legacy by remember { mutableStateOf("") }
    var specialRequests by remember { mutableStateOf("") }
    var burialExpanded by remember { mutableStateOf(false) }
    var ceremonyExpanded by remember { mutableStateOf(false) }

    // Populate from loaded wishes
    LaunchedEffect(state.wishes) {
        state.wishes?.let { w ->
            burialIndex = burialTypes.indexOfFirst { it == w.burialType }.coerceAtLeast(0)
            ceremonyIndex = ceremonyTypes.indexOfFirst { it == w.ceremonyType }.coerceAtLeast(0)
            music = w.musicPreferences ?: ""
            readings = w.readingPreferences ?: ""
            legacy = w.legacyMessage ?: ""
            specialRequests = w.specialRequests ?: ""
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
            Text("Funeral Wishes", style = MaterialTheme.typography.titleLarge, color = WarmPaper)
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
                if (state.saved) {
                    Text("Wishes saved.", color = Sage, style = MaterialTheme.typography.bodySmall)
                }
                if (state.error != null) {
                    Text(state.error!!, color = Ember, style = MaterialTheme.typography.bodySmall)
                }

                ExposedDropdownMenuBox(expanded = burialExpanded, onExpandedChange = { burialExpanded = it }) {
                    OutlinedTextField(
                        value = burialTypes[burialIndex],
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Burial type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(burialExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                    )
                    ExposedDropdownMenu(expanded = burialExpanded, onDismissRequest = { burialExpanded = false }) {
                        burialTypes.forEachIndexed { i, t ->
                            DropdownMenuItem(text = { Text(t) }, onClick = { burialIndex = i; burialExpanded = false })
                        }
                    }
                }

                ExposedDropdownMenuBox(expanded = ceremonyExpanded, onExpandedChange = { ceremonyExpanded = it }) {
                    OutlinedTextField(
                        value = ceremonyTypes[ceremonyIndex],
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Ceremony type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(ceremonyExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                    )
                    ExposedDropdownMenu(expanded = ceremonyExpanded, onDismissRequest = { ceremonyExpanded = false }) {
                        ceremonyTypes.forEachIndexed { i, t ->
                            DropdownMenuItem(text = { Text(t) }, onClick = { ceremonyIndex = i; ceremonyExpanded = false })
                        }
                    }
                }

                OutlinedTextField(value = music, onValueChange = { music = it },
                    label = { Text("Music preferences") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = readings, onValueChange = { readings = it },
                    label = { Text("Reading preferences") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = legacy, onValueChange = { legacy = it },
                    label = { Text("Legacy message") }, minLines = 3, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = specialRequests, onValueChange = { specialRequests = it },
                    label = { Text("Special requests") }, modifier = Modifier.fillMaxWidth())

                Button(
                    onClick = {
                        viewModel.save(
                            WishesDto(
                                burialType = burialTypes[burialIndex],
                                ceremonyType = ceremonyTypes[ceremonyIndex],
                                musicPreferences = music.trim().ifBlank { null },
                                readingPreferences = readings.trim().ifBlank { null },
                                legacyMessage = legacy.trim().ifBlank { null },
                                specialRequests = specialRequests.trim().ifBlank { null },
                            )
                        )
                    },
                    enabled = !state.saving,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
                ) { Text("Save wishes") }
            }
        }
    }
}
