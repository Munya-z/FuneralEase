package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.MemberDto
import com.funeralease.app.data.api.ReferralDto
import com.funeralease.app.data.api.SubscriptionDto
import com.funeralease.app.data.local.SessionStore
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HouseholdRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
    private val session: SessionStore,
) {
    suspend fun getMembers(): List<MemberDto> {
        val token = auth.bearerToken() ?: error("Not authenticated")
        val householdId = session.householdId.firstOrNull() ?: error("No household")
        return api.getMembers(token, householdId)
    }

    suspend fun addMember(fullName: String, mobileNumber: String) {
        val token = auth.bearerToken() ?: error("Not authenticated")
        val householdId = session.householdId.firstOrNull() ?: error("No household")
        api.addMember(token, householdId, mapOf("fullName" to fullName, "mobileNumber" to mobileNumber))
    }

    suspend fun getSubscription(): SubscriptionDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        val householdId = session.householdId.firstOrNull() ?: error("No household")
        return api.getSubscription(token, householdId)
    }

    suspend fun getReferral(): ReferralDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        val householdId = session.householdId.firstOrNull() ?: error("No household")
        return api.getReferral(token, householdId)
    }
}
