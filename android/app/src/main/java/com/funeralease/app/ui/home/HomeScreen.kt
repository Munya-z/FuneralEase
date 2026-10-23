package com.funeralease.app.ui.home

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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.funeralease.app.data.api.PolicyDto
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.Sage
import com.funeralease.app.ui.theme.WarmPaper
import java.util.Calendar

@Composable
fun HomeScreen(viewModel: HomeViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize().background(WarmPaper)) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(DuskInk)
                .padding(horizontal = 20.dp, vertical = 20.dp)
                .padding(top = 20.dp),
        ) {
            Text(greeting(), style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
            if (!state.loading) {
                val attention = state.policies.count { it.lapseStatus != "Current" }
                Text(
                    "${state.policies.size} policies · $attention need attention",
                    style = MaterialTheme.typography.bodySmall,
                    color = WarmPaper.copy(alpha = 0.6f),
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }

        if (state.loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Candlewick)
            }
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                items(state.policies) { policy ->
                    PolicyCard(policy = policy, onMarkPaid = { viewModel.markPaid(policy.id) })
                }
            }
        }
    }
}

@Composable
private fun PolicyCard(policy: PolicyDto, onMarkPaid: () -> Unit) {
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
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(policy.insurerName, style = MaterialTheme.typography.titleMedium, color = DuskInk)
                Text(
                    policy.lapseStatus,
                    style = MaterialTheme.typography.labelSmall,
                    color = statusColor,
                )
            }
            Text(
                "Policy: ${policy.policyNumber}",
                style = MaterialTheme.typography.bodySmall,
                color = DuskInk.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 4.dp),
            )
            Text(
                "Premium: R${policy.premiumAmount.toLong()}  ·  Due: ${policy.nextDueDate.take(10)}",
                style = MaterialTheme.typography.bodySmall,
                color = DuskInk.copy(alpha = 0.6f),
                modifier = Modifier.padding(top = 2.dp),
            )
        }
    }
}

private fun greeting(): String = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
    in 0..11 -> "Good morning"
    in 12..16 -> "Good afternoon"
    else -> "Good evening"
}
