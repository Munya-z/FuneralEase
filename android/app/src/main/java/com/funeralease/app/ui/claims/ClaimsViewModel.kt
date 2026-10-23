package com.funeralease.app.ui.claims

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.ClaimDto
import com.funeralease.app.data.api.PolicyDto
import com.funeralease.app.data.repository.ClaimsRepository
import com.funeralease.app.data.repository.PolicyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ClaimsUiState(val loading: Boolean = true, val claims: List<ClaimDto> = emptyList(), val policies: List<PolicyDto> = emptyList(), val error: String? = null)

@HiltViewModel
class ClaimsViewModel @Inject constructor(
    private val claimsRepo: ClaimsRepository,
    private val policyRepo: PolicyRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ClaimsUiState())
    val state: StateFlow<ClaimsUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = ClaimsUiState(loading = true)
            try {
                val claims = claimsRepo.getClaims()
                val policies = policyRepo.getPolicies()
                _state.value = ClaimsUiState(loading = false, claims = claims, policies = policies)
            } catch (e: Exception) { _state.value = ClaimsUiState(loading = false, error = e.message) }
        }
    }

    fun createClaim(policyId: String, deceasedFullName: String) {
        viewModelScope.launch {
            try { claimsRepo.createClaim(policyId, deceasedFullName); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }
}
