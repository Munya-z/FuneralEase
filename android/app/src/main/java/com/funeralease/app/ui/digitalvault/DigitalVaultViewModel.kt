package com.funeralease.app.ui.digitalvault

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.DigitalAssetDto
import com.funeralease.app.data.repository.DigitalVaultRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DigitalVaultUiState(val loading: Boolean = true, val assets: List<DigitalAssetDto> = emptyList(), val error: String? = null)

@HiltViewModel
class DigitalVaultViewModel @Inject constructor(private val repo: DigitalVaultRepository) : ViewModel() {
    private val _state = MutableStateFlow(DigitalVaultUiState())
    val state: StateFlow<DigitalVaultUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = DigitalVaultUiState(loading = true)
            try { _state.value = DigitalVaultUiState(loading = false, assets = repo.list()) }
            catch (e: Exception) { _state.value = DigitalVaultUiState(loading = false, error = e.message) }
        }
    }

    fun create(category: String, serviceName: String, username: String?, notes: String?, url: String?, onDeathInstruction: String) {
        viewModelScope.launch {
            try { repo.create(category, serviceName, username, notes, url, onDeathInstruction); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }

    fun delete(id: String) {
        viewModelScope.launch {
            try { repo.delete(id); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }
}
