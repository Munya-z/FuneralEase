package com.funeralease.app.ui.upgrade

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.SubscriptionDto
import com.funeralease.app.data.repository.HouseholdRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class UpgradeUiState(
    val loading: Boolean = true,
    val subscription: SubscriptionDto? = null,
    val error: String? = null,
)

@HiltViewModel
class UpgradeViewModel @Inject constructor(private val repo: HouseholdRepository) : ViewModel() {
    private val _state = MutableStateFlow(UpgradeUiState())
    val state: StateFlow<UpgradeUiState> = _state

    init { load() }

    private fun load() {
        viewModelScope.launch {
            _state.value = UpgradeUiState(loading = true)
            try {
                _state.value = UpgradeUiState(loading = false, subscription = repo.getSubscription())
            } catch (e: Exception) {
                _state.value = UpgradeUiState(loading = false, error = e.message)
            }
        }
    }
}
