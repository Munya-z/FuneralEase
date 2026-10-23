package com.funeralease.app.ui.more

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.ReferralDto
import com.funeralease.app.data.api.SubscriptionDto
import com.funeralease.app.data.repository.AuthRepository
import com.funeralease.app.data.repository.HouseholdRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MoreUiState(val loading: Boolean = true, val subscription: SubscriptionDto? = null, val referral: ReferralDto? = null, val loggedOut: Boolean = false, val error: String? = null)

@HiltViewModel
class MoreViewModel @Inject constructor(
    private val householdRepo: HouseholdRepository,
    private val authRepo: AuthRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(MoreUiState())
    val state: StateFlow<MoreUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = MoreUiState(loading = true)
            try {
                val sub = householdRepo.getSubscription()
                val ref = householdRepo.getReferral()
                _state.value = MoreUiState(loading = false, subscription = sub, referral = ref)
            } catch (e: Exception) { _state.value = MoreUiState(loading = false, error = e.message) }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepo.logout()
            _state.value = _state.value.copy(loggedOut = true)
        }
    }
}
