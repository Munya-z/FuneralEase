package com.funeralease.app.ui.vault

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.PolicyDto
import com.funeralease.app.data.repository.PolicyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class VaultUiState(val loading: Boolean = true, val policies: List<PolicyDto> = emptyList(), val error: String? = null)

@HiltViewModel
class VaultViewModel @Inject constructor(private val repo: PolicyRepository) : ViewModel() {
    private val _state = MutableStateFlow(VaultUiState())
    val state: StateFlow<VaultUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = VaultUiState(loading = true)
            try { _state.value = VaultUiState(loading = false, policies = repo.getPolicies()) }
            catch (e: Exception) { _state.value = VaultUiState(loading = false, error = e.message) }
        }
    }

    fun addPolicy(insurerName: String, policyNumber: String, premium: Double, dueDate: String) {
        viewModelScope.launch {
            try { repo.createPolicy(insurerName, policyNumber, premium, dueDate); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }
}
