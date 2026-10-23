package com.funeralease.app.ui.burialsociety

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.BurialSocietyDto
import com.funeralease.app.data.repository.BurialSocietyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BurialSocietyUiState(val loading: Boolean = true, val society: BurialSocietyDto? = null, val notFound: Boolean = false, val error: String? = null)

@HiltViewModel
class BurialSocietyViewModel @Inject constructor(private val repo: BurialSocietyRepository) : ViewModel() {
    private val _state = MutableStateFlow(BurialSocietyUiState())
    val state: StateFlow<BurialSocietyUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = BurialSocietyUiState(loading = true)
            try { _state.value = BurialSocietyUiState(loading = false, society = repo.getMy()) }
            catch (e: retrofit2.HttpException) {
                if (e.code() == 404) _state.value = BurialSocietyUiState(loading = false, notFound = true)
                else _state.value = BurialSocietyUiState(loading = false, error = e.message)
            } catch (e: Exception) { _state.value = BurialSocietyUiState(loading = false, error = e.message) }
        }
    }

    fun create(name: String, monthlyAmount: Double) {
        viewModelScope.launch {
            try { repo.create(name, monthlyAmount, null); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }
}
