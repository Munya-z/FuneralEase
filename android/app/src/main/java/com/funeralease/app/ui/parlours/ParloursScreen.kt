package com.funeralease.app.ui.parlours

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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.ParlourDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun ParloursScreen(
    viewModel: ParloursViewModel = hiltViewModel(),
    onBack: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var searchText by remember { mutableStateOf("") }

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
            Text("Find Parlours", style = MaterialTheme.typography.titleLarge, color = WarmPaper)
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = searchText,
                onValueChange = { searchText = it },
                label = { Text("Search by area") },
                singleLine = true,
                modifier = Modifier.weight(1f),
            )
            Button(
                onClick = { viewModel.load(area = searchText.trim().ifBlank { null }) },
                colors = ButtonDefaults.buttonColors(containerColor = DuskInk),
            ) { Text("Search") }
        }

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
            state.parlours.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No parlours found.", color = DuskInk.copy(alpha = 0.5f))
            }
            else -> LazyColumn(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
                items(state.parlours) { parlour -> ParlourCard(parlour) }
            }
        }
    }
}

@Composable
private fun ParlourCard(parlour: ParlourDto) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(parlour.name, style = MaterialTheme.typography.titleMedium, color = DuskInk)
            Text(
                "${parlour.area}, ${parlour.province}",
                style = MaterialTheme.typography.bodySmall,
                color = DuskInk.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 4.dp),
            )
            Text(
                parlour.phoneNumber,
                style = MaterialTheme.typography.bodySmall,
                color = Candlewick,
                modifier = Modifier.padding(top = 2.dp),
            )
            if (!parlour.description.isNullOrBlank()) {
                Text(
                    parlour.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = DuskInk.copy(alpha = 0.5f),
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }
    }
}
