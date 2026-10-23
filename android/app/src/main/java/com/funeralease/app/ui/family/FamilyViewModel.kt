package com.funeralease.app.ui.family

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.funeralease.app.data.api.EmergencySessionDto
import com.funeralease.app.data.api.MemberDto
import com.funeralease.app.data.repository.EmergencyRepository
import com.funeralease.app.data.repository.HouseholdRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class FamilyUiState(val loading: Boolean = true, val session: EmergencySessionDto? = null, val members: List<MemberDto> = emptyList(), val error: String? = null)

@HiltViewModel
class FamilyViewModel @Inject constructor(
    private val emergencyRepo: EmergencyRepository,
    private val householdRepo: HouseholdRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(FamilyUiState())
    val state: StateFlow<FamilyUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = FamilyUiState(loading = true)
            try {
                val session = emergencyRepo.getSession()
                val members = householdRepo.getMembers()
                _state.value = FamilyUiState(loading = false, session = session, members = members)
            } catch (e: Exception) { _state.value = FamilyUiState(loading = false, error = e.message) }
        }
    }

    fun addMember(fullName: String, mobileNumber: String) {
        viewModelScope.launch {
            try { householdRepo.addMember(fullName, mobileNumber); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }

    fun requestGrant(contactId: String) {
        viewModelScope.launch {
            try { emergencyRepo.requestGrant(contactId); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }

    fun revokeGrant(grantId: String) {
        viewModelScope.launch {
            try { emergencyRepo.revokeGrant(grantId); load() }
            catch (e: Exception) { _state.value = _state.value.copy(error = e.message) }
        }
    }
}
