package com.funeralease.app.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavBackStackEntry
import com.funeralease.app.R
import com.funeralease.app.ui.theme.Candlewick
import com.funeralease.app.ui.theme.DuskInk
import com.funeralease.app.ui.theme.Ember
import com.funeralease.app.ui.theme.WarmPaper

// ── Auth Gate (checks saved session) ─────────────────────────────────────────

@Composable
fun AuthGateScreen(
    authEntry: NavBackStackEntry,
    onHasSavedSession: () -> Unit,
    onNoSavedSession: () -> Unit,
) {
    val viewModel: AuthViewModel = hiltViewModel(authEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) { viewModel.checkSession() }

    LaunchedEffect(state) {
        when (state) {
            is AuthState.HasSavedSession -> onHasSavedSession()
            is AuthState.NoSavedSession  -> onNoSavedSession()
            else -> Unit
        }
    }

    Box(
        modifier = Modifier.fillMaxSize().background(DuskInk),
        contentAlignment = Alignment.Center,
    ) {
        CircularProgressIndicator(color = WarmPaper)
    }
}

// ── PIN Login (returning users) ───────────────────────────────────────────────

@Composable
fun PinLoginScreen(
    authEntry: NavBackStackEntry,
    onLoggedIn: () -> Unit,
    onUseOtp: () -> Unit,
) {
    val viewModel: AuthViewModel = hiltViewModel(authEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()

    val savedState = state as? AuthState.HasSavedSession
    val name  = savedState?.name  ?: ""
    val phone = savedState?.phone ?: ""

    var pin by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        if (state is AuthState.LoggedIn) onLoggedIn()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DuskInk)
            .padding(horizontal = 32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "FuneralEase logo",
            tint = WarmPaper,
            modifier = Modifier.size(72.dp),
        )

        Spacer(Modifier.height(16.dp))

        Text(
            if (name.isNotBlank()) "Welcome back, $name" else "Welcome back",
            style = MaterialTheme.typography.headlineSmall,
            color = WarmPaper,
            textAlign = TextAlign.Center,
        )
        Text(
            phone,
            style = MaterialTheme.typography.bodyMedium,
            color = WarmPaper.copy(alpha = 0.6f),
            modifier = Modifier.padding(top = 4.dp, bottom = 32.dp),
        )

        BasicTextField(
            value = pin,
            onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) pin = it },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
            cursorBrush = SolidColor(Candlewick),
            modifier = Modifier.fillMaxWidth(),
            decorationBox = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    repeat(6) { index ->
                        val char = pin.getOrNull(index)
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(48.dp)
                                .border(
                                    1.dp,
                                    if (char != null) Candlewick else WarmPaper.copy(alpha = 0.3f),
                                    MaterialTheme.shapes.small,
                                )
                                .background(
                                    if (char != null) Candlewick.copy(alpha = 0.1f) else DuskInk,
                                    MaterialTheme.shapes.small,
                                ),
                        ) {
                            Text(
                                if (char != null) "•" else "",
                                style = MaterialTheme.typography.titleLarge,
                                color = WarmPaper,
                            )
                        }
                    }
                }
            },
        )

        if (state is AuthState.Error) {
            Text(
                (state as AuthState.Error).message,
                color = Ember,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 12.dp),
                textAlign = TextAlign.Center,
            )
        }

        Spacer(Modifier.height(32.dp))

        Button(
            onClick = { viewModel.loginWithPin(pin) },
            enabled = pin.length == 6 && state !is AuthState.Loading,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Candlewick),
        ) {
            if (state is AuthState.Loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = WarmPaper)
            } else {
                Text("Sign in", color = WarmPaper)
            }
        }

        TextButton(
            onClick = onUseOtp,
            modifier = Modifier.padding(top = 8.dp),
        ) {
            Text("Use a different number / OTP", color = WarmPaper.copy(alpha = 0.6f))
        }
    }
}

// ── Onboarding ────────────────────────────────────────────────────────────────

@Composable
fun OnboardingScreen(
    authEntry: NavBackStackEntry,
    onOtpSent: () -> Unit,
    onRegister: () -> Unit,
) {
    val viewModel: AuthViewModel = hiltViewModel(authEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()

    var phone by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        if (state is AuthState.OtpSent) onOtpSent()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DuskInk)
            .padding(horizontal = 32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Logo
        Icon(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "FuneralEase logo",
            tint = WarmPaper,
            modifier = Modifier.size(80.dp),
        )

        Spacer(Modifier.height(16.dp))

        Text(
            "FuneralEase",
            style = MaterialTheme.typography.headlineLarge,
            color = WarmPaper,
        )
        Text(
            "Protecting what matters most",
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
                "Don't have an account?",
                style = MaterialTheme.typography.bodyMedium,
                color = WarmPaper.copy(alpha = 0.6f),
            )
            TextButton(onClick = onRegister) {
                Text("Register", color = Candlewick, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

// ── OTP ───────────────────────────────────────────────────────────────────────

@Composable
fun OtpScreen(
    authEntry: NavBackStackEntry,
    onNeedsName: () -> Unit,
    onLoggedIn: () -> Unit,
    onBack: () -> Unit,
) {
    val viewModel: AuthViewModel = hiltViewModel(authEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()

    var otp by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        when (state) {
            is AuthState.NeedsName -> onNeedsName()
            is AuthState.Verified  -> onLoggedIn()
            else -> Unit
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DuskInk)
            .padding(horizontal = 32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Enter verification code", style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
        Text(
            "We sent a code to ${viewModel.pendingPhone}",
            style = MaterialTheme.typography.bodyMedium,
            color = WarmPaper.copy(alpha = 0.6f),
            modifier = Modifier.padding(top = 8.dp, bottom = 32.dp),
        )

        // Hidden field + visual boxes
        BasicTextField(
            value = otp,
            onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) otp = it },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
            cursorBrush = SolidColor(Candlewick),
            modifier = Modifier.fillMaxWidth(),
            decorationBox = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    repeat(6) { index ->
                        val char = otp.getOrNull(index)
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(48.dp)
                                .border(
                                    1.dp,
                                    if (char != null) Candlewick else WarmPaper.copy(alpha = 0.3f),
                                    MaterialTheme.shapes.small,
                                )
                                .background(
                                    if (char != null) Candlewick.copy(alpha = 0.1f) else DuskInk,
                                    MaterialTheme.shapes.small,
                                ),
                        ) {
                            Text(
                                char?.toString() ?: "",
                                style = MaterialTheme.typography.titleLarge,
                                color = WarmPaper,
                            )
                        }
                    }
                }
            },
        )

        if (state is AuthState.Error) {
            Text(
                (state as AuthState.Error).message,
                color = Ember,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 12.dp),
            )
        }

        Spacer(Modifier.height(32.dp))

        Button(
            onClick = { viewModel.processOtp(otp) },
            enabled = otp.length == 6 && state !is AuthState.Loading,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Candlewick),
        ) {
            if (state is AuthState.Loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = WarmPaper)
            } else {
                Text("Continue", color = WarmPaper)
            }
        }

        TextButton(onClick = onBack, modifier = Modifier.padding(top = 8.dp)) {
            Text("Change number", color = WarmPaper.copy(alpha = 0.6f))
        }
    }
}

// ── Name ──────────────────────────────────────────────────────────────────────

@Composable
fun NameScreen(
    authEntry: NavBackStackEntry,
    onVerified: () -> Unit,
) {
    val viewModel: AuthViewModel = hiltViewModel(authEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()

    var fullName by remember { mutableStateOf("") }
    var popiaChecked by remember { mutableStateOf(false) }

    LaunchedEffect(state) {
        if (state is AuthState.Verified) onVerified()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DuskInk)
            .padding(horizontal = 32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "FuneralEase logo",
            tint = WarmPaper,
            modifier = Modifier.size(72.dp),
        )

        Spacer(Modifier.height(16.dp))

        Text("What's your name?", style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
        Text(
            "This helps us personalise your vault",
            style = MaterialTheme.typography.bodyMedium,
            color = WarmPaper.copy(alpha = 0.6f),
            modifier = Modifier.padding(top = 8.dp, bottom = 32.dp),
        )

        OutlinedTextField(
            value = fullName,
            onValueChange = { fullName = it },
            label = { Text("Full name") },
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

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Checkbox(
                checked = popiaChecked,
                onCheckedChange = { popiaChecked = it },
            )
            Spacer(Modifier.width(8.dp))
            Text(
                "I consent to FuneralEase processing my personal information in accordance with POPIA",
                style = MaterialTheme.typography.bodySmall,
                color = WarmPaper.copy(alpha = 0.8f),
            )
        }

        if (state is AuthState.Error) {
            Text(
                (state as AuthState.Error).message,
                color = Ember,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 8.dp),
                textAlign = TextAlign.Center,
            )
        }

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = {
                viewModel.verifyOtp(
                    code = viewModel.pendingOtp,
                    fullName = fullName.trim(),
                    popiaConsentGiven = popiaChecked,
                )
            },
            enabled = fullName.isNotBlank() && popiaChecked && state !is AuthState.Loading,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Candlewick),
        ) {
            if (state is AuthState.Loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = WarmPaper)
            } else {
                Text("Create my vault", color = WarmPaper)
            }
        }
    }
}

// ── PIN Setup ─────────────────────────────────────────────────────────────────

@Composable
fun PinScreen(
    authEntry: NavBackStackEntry,
    onDone: () -> Unit,
) {
    val viewModel: AuthViewModel = hiltViewModel(authEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()

    val accessToken = remember(state) {
        (state as? AuthState.Verified)?.accessToken ?: ""
    }

    var pin by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        if (state is AuthState.PinDone) onDone()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DuskInk)
            .padding(horizontal = 32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "FuneralEase logo",
            tint = WarmPaper,
            modifier = Modifier.size(72.dp),
        )

        Spacer(Modifier.height(16.dp))

        Text("Set a PIN", style = MaterialTheme.typography.headlineSmall, color = WarmPaper)
        Text(
            "Choose a 6-digit PIN to sign in quickly next time",
            style = MaterialTheme.typography.bodyMedium,
            color = WarmPaper.copy(alpha = 0.6f),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp, bottom = 32.dp),
        )

        BasicTextField(
            value = pin,
            onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) pin = it },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
            cursorBrush = SolidColor(Candlewick),
            modifier = Modifier.fillMaxWidth(),
            decorationBox = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    repeat(6) { index ->
                        val char = pin.getOrNull(index)
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(48.dp)
                                .border(
                                    1.dp,
                                    if (char != null) Candlewick else WarmPaper.copy(alpha = 0.3f),
                                    MaterialTheme.shapes.small,
                                )
                                .background(
                                    if (char != null) Candlewick.copy(alpha = 0.1f) else DuskInk,
                                    MaterialTheme.shapes.small,
                                ),
                        ) {
                            Text(
                                if (char != null) "•" else "",
                                style = MaterialTheme.typography.titleLarge,
                                color = WarmPaper,
                            )
                        }
                    }
                }
            },
        )

        Spacer(Modifier.height(32.dp))

        Button(
            onClick = { viewModel.setPin(accessToken, pin) },
            enabled = pin.length == 6 && state !is AuthState.Loading,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Candlewick),
        ) {
            if (state is AuthState.Loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = WarmPaper)
            } else {
                Text("Set PIN & open my vault", color = WarmPaper)
            }
        }

        TextButton(
            onClick = { viewModel.skipPin() },
            modifier = Modifier.padding(top = 8.dp),
        ) {
            Text("Skip for now", color = WarmPaper.copy(alpha = 0.6f))
        }
    }
}
