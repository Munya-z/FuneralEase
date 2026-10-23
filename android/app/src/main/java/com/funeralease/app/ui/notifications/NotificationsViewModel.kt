package com.funeralease.app.ui.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.NotificationSettingsDto
import com.funeralease.app.data.repository.NotificationsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationsUiState(
    val loading: Boolean = true,
    val settings: NotificationSettingsDto? = null,
    val saving: Boolean = false,
    val saved: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(private val repo: NotificationsRepository) : ViewModel() {
    private val _state = MutableStateFlow(NotificationsUiState())
    val state: StateFlow<NotificationsUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = NotificationsUiState(loading = true)
            try {
                _state.value = NotificationsUiState(loading = false, settings = repo.getSettings())
            } catch (e: Exception) {
                _state.value = NotificationsUiState(loading = false, error = e.message)
            }
        }
    }

    fun save(settings: NotificationSettingsDto) {
        viewModelScope.launch {
            _state.value = _state.value.copy(saving = true, saved = false, error = null)
            try {
                val result = repo.updateSettings(settings)
                _state.value = _state.value.copy(saving = false, saved = true, settings = result)
            } catch (e: Exception) {
                _state.value = _state.value.copy(saving = false, error = e.message)
            }
        }
    }
}
