package com.funeralease.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class RegisterState {
    object Idle : RegisterState()
    object Loading : RegisterState()
    object OtpSent : RegisterState()
    data class ReadyForPin(val accessToken: String) : RegisterState()
    object Done : RegisterState()
    data class Error(val message: String) : RegisterState()
}

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<RegisterState>(RegisterState.Idle)
    val state: StateFlow<RegisterState> = _state

    fun requestOtp(mobileNumber: String) {
        viewModelScope.launch {
            _state.value = RegisterState.Loading
            try {
                authRepository.requestOtp(mobileNumber)
                _state.value = RegisterState.OtpSent
            } catch (e: Exception) {
                _state.value = RegisterState.Error(e.message ?: "Failed to send code")
            }
        }
    }

    fun verifyAndPrepare(phone: String, otp: String, fullName: String, popia: Boolean) {
        viewModelScope.launch {
            _state.value = RegisterState.Loading
            try {
                val token = authRepository.verifyOtp(phone, otp, fullName, popia)
                _state.value = RegisterState.ReadyForPin(token)
            } catch (e: Exception) {
                _state.value = RegisterState.Error(e.message ?: "Something went wrong")
            }
        }
    }

    fun setPin(accessToken: String, pin: String) {
        viewModelScope.launch {
            _state.value = RegisterState.Loading
            try {
                authRepository.setPin(accessToken, pin)
            } catch (_: Exception) {
                // PIN setup is optional — let the user in regardless
            }
            _state.value = RegisterState.Done
        }
    }

    fun skipPin() {
        _state.value = RegisterState.Done
    }

    fun clearError() {
        if (_state.value is RegisterState.Error) _state.value = RegisterState.Idle
    }
}
