package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.CreatePolicyRequest
import com.funeralease.app.data.api.PolicyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PolicyRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun getPolicies(): List<PolicyDto> {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getPolicies(token)
    }

    suspend fun createPolicy(
        insurerName: String,
        policyNumber: String,
        premiumAmount: Double,
        nextDueDate: String,
    ): PolicyDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.createPolicy(token, CreatePolicyRequest(insurerName, policyNumber, premiumAmount, nextDueDate))
    }

    suspend fun markPaid(policyId: String) {
        val token = auth.bearerToken() ?: error("Not authenticated")
        val today = java.time.LocalDate.now().toString()
        api.markPaid(token, policyId, mapOf("paidForDate" to today))
    }
}
