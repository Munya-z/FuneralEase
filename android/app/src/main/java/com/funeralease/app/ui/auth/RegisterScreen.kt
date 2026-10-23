package com.funeralease.app.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavBackStackEntry
import com.funeralease.app.R
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.WarmPaper

@Composable
fun RegisterScreen(
    authEntry: NavBackStackEntry,
    onOtpSent: () -> Unit,
    onBack: () -> Unit,
) {
    val viewModel: AuthViewModel = hiltViewModel(authEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()

    var phone by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        if (state is AuthState.OtpSent) onOtpSent()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DuskInk),
    ) {
        IconButton(
            onClick = onBack,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(8.dp),
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = WarmPaper,
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {

        // Logo
        Icon(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "FuneralEase logo",
            tint = WarmPaper,
            modifier = Modifier.size(72.dp),
        )

        Spacer(Modifier.height(16.dp))

        Text(
            "Create your account",
            style = MaterialTheme.typography.headlineMedium,
            color = WarmPaper,
        )
        Text(
            "Enter your mobile number to get started",
            style = MaterialTheme.typography.bodyMedium,
            color = WarmPaper.copy(alpha = 0.6f),
            modifier = Modifier.padding(top = 4.dp, bottom = 40.dp),
        )

        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Mobile number") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = WarmPaper,
                unfocusedTextColor = WarmPaper,
                focusedBorderColor = Candlewick,
                unfocusedBorderColor = WarmPaper.copy(alpha = 0.5f),
                focusedLabelColor = Candlewick,
                unfocusedLabelColor = WarmPaper.copy(alpha = 0.7f),
                cursorColor = Candlewick,
            ),
        )

        if (state is AuthState.Error) {
            Text(
                (state as AuthState.Error).message,
                color = Ember,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 8.dp),
            )
        }

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = { viewModel.requestOtp(phone.trim()) },
            enabled = phone.length >= 10 && state !is AuthState.Loading,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Candlewick),
        ) {
            if (state is AuthState.Loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = WarmPaper)
            } else {
                Text("Send verification code", color = WarmPaper)
            }
        }

        Spacer(Modifier.height(16.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "Already have an account?",
                style = MaterialTheme.typography.bodyMedium,
                color = WarmPaper.copy(alpha = 0.6f),
            )
            TextButton(onClick = onBack) {
                Text("Log in", color = Candlewick, style = MaterialTheme.typography.bodyMedium)
            }
        }
        } // end Column
    } // end Box
}
