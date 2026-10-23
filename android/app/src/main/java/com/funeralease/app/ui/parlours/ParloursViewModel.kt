package com.funeralease.app.ui.parlours

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.ParlourDto
import com.funeralease.app.data.repository.ParloursRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ParloursUiState(val loading: Boolean = true, val parlours: List<ParlourDto> = emptyList(), val error: String? = null)

@HiltViewModel
class ParloursViewModel @Inject constructor(private val repo: ParloursRepository) : ViewModel() {
    private val _state = MutableStateFlow(ParloursUiState())
    val state: StateFlow<ParloursUiState> = _state

    init { load() }

    fun load(area: String? = null, province: String? = null) {
        viewModelScope.launch {
            _state.value = ParloursUiState(loading = true)
            try { _state.value = ParloursUiState(loading = false, parlours = repo.search(area, province)) }
            catch (e: Exception) { _state.value = ParloursUiState(loading = false, error = e.message) }
        }
    }
}
