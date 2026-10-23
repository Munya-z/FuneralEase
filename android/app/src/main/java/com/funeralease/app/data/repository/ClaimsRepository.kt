package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.ClaimDto
import com.funeralease.app.data.api.CreateClaimRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ClaimsRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun getClaims(): List<ClaimDto> {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getClaims(token)
    }

    suspend fun createClaim(policyId: String, deceasedFullName: String): ClaimDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.createClaim(token, CreateClaimRequest(policyId, deceasedFullName))
    }

    suspend fun getChecklist(claimId: String): ClaimDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getClaimChecklist(token, claimId)
    }

    suspend fun updateChecklistItem(claimId: String, itemId: String, isChecked: Boolean) {
        val token = auth.bearerToken() ?: error("Not authenticated")
        api.updateChecklistItem(token, claimId, itemId, mapOf("isChecked" to isChecked))
    }
}
