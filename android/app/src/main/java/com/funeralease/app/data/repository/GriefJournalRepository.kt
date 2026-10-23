package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.GriefJournalEntryDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GriefJournalRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun list(): List<GriefJournalEntryDto> {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getJournalEntries(token)
    }

    suspend fun create(content: String, mood: String): GriefJournalEntryDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.createJournalEntry(token, mapOf("content" to content, "mood" to mood))
    }

    suspend fun delete(id: String) {
        val token = auth.bearerToken() ?: error("Not authenticated")
        api.deleteJournalEntry(token, id)
    }
}
