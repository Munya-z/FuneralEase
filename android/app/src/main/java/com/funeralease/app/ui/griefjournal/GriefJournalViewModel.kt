package com.funeralease.app.ui.griefjournal

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.GriefJournalEntryDto
import com.funeralease.app.data.repository.GriefJournalRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class GriefJournalUiState(val loading: Boolean = true, val entries: List<GriefJournalEntryDto> = emptyList(), val error: String? = null)

@HiltViewModel
class GriefJournalViewModel @Inject constructor(private val repo: GriefJournalRepository) : ViewModel() {
    private val _state = MutableStateFlow(GriefJournalUiState())
    val state: StateFlow<GriefJournalUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = GriefJournalUiState(loading = true)
            try { _state.value = GriefJournalUiState(loading = false, entries = repo.list()) }
            catch (e: Exception) { _state.value = GriefJournalUiState(loading = false, error = e.message) }
        }
    }

    fun create(content: String, mood: String) {
        viewModelScope.launch {
            try { repo.create(content, mood); load() }
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
