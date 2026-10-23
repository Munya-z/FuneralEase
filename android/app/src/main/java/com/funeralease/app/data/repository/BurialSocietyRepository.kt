package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.BurialSocietyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BurialSocietyRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun getMy(): BurialSocietyDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getBurialSociety(token)
    }

    suspend fun create(name: String, monthlyContributionAmount: Double, registrationNumber: String?): BurialSocietyDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        val body = buildMap<String, Any> {
            put("name", name)
            put("monthlyContributionAmount", monthlyContributionAmount)
            if (!registrationNumber.isNullOrBlank()) put("registrationNumber", registrationNumber)
        }
        return api.createBurialSociety(token, body)
    }

    suspend fun recordContribution(societyId: String, memberId: String, amountPaid: Double, period: String) {
        val token = auth.bearerToken() ?: error("Not authenticated")
        api.recordContribution(token, societyId, mapOf(
            "memberId" to memberId,
            "amountPaid" to amountPaid,
            "period" to period,
        ))
    }
}
