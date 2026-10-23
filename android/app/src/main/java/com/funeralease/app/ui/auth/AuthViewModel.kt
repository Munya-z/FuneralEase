package com.funeralease.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    object OtpSent : AuthState()
    object NeedsName : AuthState()
    data class Verified(val accessToken: String) : AuthState()
    object PinDone : AuthState()
    object LoggedIn : AuthState()
    data class HasSavedSession(val phone: String, val name: String) : AuthState()
    object NoSavedSession : AuthState()
    data class Error(val message: String) : AuthState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state: StateFlow<AuthState> = _state

    var pendingPhone: String = ""
    var pendingOtp: String = ""

    fun requestOtp(mobileNumber: String) {
        pendingPhone = mobileNumber
        viewModelScope.launch {
            _state.value = AuthState.Loading
            try {
                authRepository.requestOtp(mobileNumber)
                _state.value = AuthState.OtpSent
            } catch (e: Exception) {
                _state.value = AuthState.Error(e.message ?: "Failed to send OTP")
            }
        }
    }

    // Called from OtpScreen — detects new vs returning user
    fun processOtp(code: String) {
        pendingOtp = code
        viewModelScope.launch {
            _state.value = AuthState.Loading
            try {
                val storedName = authRepository.savedName()
                if (!storedName.isNullOrBlank()) {
                    // Returning user — verify immediately with stored name
                    val token = authRepository.verifyOtp(pendingPhone, code, storedName, true)
                    _state.value = AuthState.Verified(token)
                } else {
                    // New user — need to collect name
                    _state.value = AuthState.NeedsName
                }
            } catch (e: Exception) {
                _state.value = AuthState.Error(e.message ?: "Invalid code")
            }
        }
    }

    fun verifyOtp(code: String, fullName: String, popiaConsentGiven: Boolean) {
        pendingOtp = code
        viewModelScope.launch {
            _state.value = AuthState.Loading
            try {
                val token = authRepository.verifyOtp(pendingPhone, code, fullName, popiaConsentGiven)
                _state.value = AuthState.Verified(token)
            } catch (e: Exception) {
                _state.value = AuthState.Error(e.message ?: "Invalid code")
            }
        }
    }

    fun setPin(accessToken: String, pin: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            try {
                authRepository.setPin(accessToken, pin)
            } catch (_: Exception) {
                // PIN is optional — proceed regardless
            }
            _state.value = AuthState.PinDone
        }
    }

    fun skipPin() {
        _state.value = AuthState.PinDone
    }

    fun checkSession() {
        viewModelScope.launch {
            val phone = authRepository.savedMobileNumber()
            val name = authRepository.savedName()
            _state.value = if (!phone.isNullOrBlank()) {
                AuthState.HasSavedSession(phone, name ?: "")
            } else {
                AuthState.NoSavedSession
            }
        }
    }

    fun loginWithPin(pin: String) {
        viewModelScope.launch {
            _state.value = AuthState.Loading
            try {
                authRepository.loginWithPin(pin)
                _state.value = AuthState.LoggedIn
            } catch (e: Exception) {
                _state.value = AuthState.Error(e.message ?: "Incorrect PIN")
            }
        }
    }

    fun resetError() {
        _state.value = AuthState.Idle
    }
}
