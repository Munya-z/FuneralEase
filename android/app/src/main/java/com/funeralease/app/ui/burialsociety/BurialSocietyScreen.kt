package com.funeralease.app.ui.burialsociety

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
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
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun BurialSocietyScreen(
    viewModel: BurialSocietyViewModel = hiltViewModel(),
    onBack: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

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
            Text("Burial Society", style = MaterialTheme.typography.titleLarge, color = WarmPaper)
        }

        if (state.error != null) {
            Text(state.error!!, color = Ember, modifier = Modifier.padding(16.dp))
        }

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
            state.notFound || state.society == null -> CreateSocietyForm(
                onCreate = { name, amount -> viewModel.create(name, amount) },
            )
            else -> {
                val society = state.society!!
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(society.name, style = MaterialTheme.typography.titleLarge, color = DuskInk)
                            Text(
                                "R${society.monthlyContributionAmount.toLong()} / month",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Candlewick,
                                modifier = Modifier.padding(top = 4.dp),
                            )
                            Text(
                                "${society.members.size} ${if (society.members.size == 1) "member" else "members"}",
                                style = MaterialTheme.typography.bodySmall,
                                color = DuskInk.copy(alpha = 0.6f),
                                modifier = Modifier.padding(top = 4.dp),
                            )
                        }
                    }

                    HorizontalDivider()
                    Text("Members", style = MaterialTheme.typography.titleSmall, color = DuskInk)

                    society.members.forEach { member ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(member.fullName, style = MaterialTheme.typography.bodyMedium, color = DuskInk)
                                Text(
                                    member.mobileNumber,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DuskInk.copy(alpha = 0.6f),
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CreateSocietyForm(onCreate: (String, Double) -> Unit) {
    var name by remember { mutableStateOf("") }
    var contribution by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Create a burial society", style = MaterialTheme.typography.titleMedium, color = DuskInk)
        OutlinedTextField(value = name, onValueChange = { name = it },
            label = { Text("Society name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = contribution, onValueChange = { contribution = it },
            label = { Text("Monthly contribution (R)") }, singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            modifier = Modifier.fillMaxWidth())
        Button(
            onClick = {
                val amount = contribution.toDoubleOrNull() ?: return@Button
                if (name.isNotBlank()) onCreate(name.trim(), amount)
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
        ) { Text("Create society") }
    }
}
