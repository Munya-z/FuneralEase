package com.funeralease.app.data.repository

import com.funeralease.app.data.api.AccessGrantDto
import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.EmergencySessionDto
import com.funeralease.app.data.api.MemberDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EmergencyRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun getSession(): EmergencySessionDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getEmergencySession(token)
    }

    suspend fun upsertContacts(
        contacts: List<Map<String, String>>,
    ): EmergencySessionDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.upsertContacts(token, mapOf("contacts" to contacts))
    }

    suspend fun requestGrant(contactId: String): AccessGrantDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.requestGrant(token, mapOf("contactId" to contactId))
    }

    suspend fun revokeGrant(grantId: String) {
        val token = auth.bearerToken() ?: error("Not authenticated")
        api.revokeGrant(token, grantId)
    }
}
