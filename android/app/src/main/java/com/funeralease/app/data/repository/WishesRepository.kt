package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.WishesDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WishesRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun get(): WishesDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getWishes(token)
    }

    suspend fun upsert(wishes: WishesDto): WishesDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.upsertWishes(token, wishes)
    }
}
