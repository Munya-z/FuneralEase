package com.funeralease.app.ui.wishes

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.WishesDto
import com.funeralease.app.data.repository.WishesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class WishesUiState(
    val loading: Boolean = true,
    val wishes: WishesDto? = null,
    val saving: Boolean = false,
    val saved: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class WishesViewModel @Inject constructor(private val repo: WishesRepository) : ViewModel() {
    private val _state = MutableStateFlow(WishesUiState())
    val state: StateFlow<WishesUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = WishesUiState(loading = true)
            try {
                val wishes = repo.get()
                _state.value = WishesUiState(loading = false, wishes = wishes)
            } catch (e: retrofit2.HttpException) {
                if (e.code() == 404) _state.value = WishesUiState(loading = false, wishes = null)
                else _state.value = WishesUiState(loading = false, error = e.message)
            } catch (e: Exception) {
                _state.value = WishesUiState(loading = false, wishes = null)
            }
        }
    }

    fun save(wishes: WishesDto) {
        viewModelScope.launch {
            _state.value = _state.value.copy(saving = true, saved = false, error = null)
            try {
                val result = repo.upsert(wishes)
                _state.value = _state.value.copy(saving = false, saved = true, wishes = result)
            } catch (e: Exception) {
                _state.value = _state.value.copy(saving = false, error = e.message)
            }
        }
    }
}
