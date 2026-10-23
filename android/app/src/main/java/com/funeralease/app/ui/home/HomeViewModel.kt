package com.funeralease.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.ClaimDto
import com.funeralease.app.data.api.PolicyDto
import com.funeralease.app.data.repository.AuthRepository
import com.funeralease.app.data.repository.PolicyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val loading: Boolean = true,
    val policies: List<PolicyDto> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val policyRepository: PolicyRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = HomeUiState(loading = true)
            try {
                val policies = policyRepository.getPolicies()
                _uiState.value = HomeUiState(loading = false, policies = policies)
            } catch (e: Exception) {
                _uiState.value = HomeUiState(loading = false, error = e.message)
            }
        }
    }

    fun markPaid(policyId: String) {
        viewModelScope.launch {
            try {
                policyRepository.markPaid(policyId)
                load()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(error = e.message)
            }
        }
    }
}
