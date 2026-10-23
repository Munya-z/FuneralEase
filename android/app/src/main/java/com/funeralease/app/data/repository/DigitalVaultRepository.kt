package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.DigitalAssetDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DigitalVaultRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun list(): List<DigitalAssetDto> {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getDigitalAssets(token)
    }

    suspend fun create(category: String, serviceName: String, username: String?, notes: String?, url: String?, onDeathInstruction: String): DigitalAssetDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        val body = buildMap<String, Any> {
            put("category", category)
            put("serviceName", serviceName)
            if (!username.isNullOrBlank()) put("username", username)
            if (!notes.isNullOrBlank()) put("notes", notes)
            if (!url.isNullOrBlank()) put("url", url)
            put("onDeathInstruction", onDeathInstruction)
        }
        return api.createDigitalAsset(token, body)
    }

    suspend fun delete(id: String) {
        val token = auth.bearerToken() ?: error("Not authenticated")
        api.deleteDigitalAsset(token, id)
    }
}
