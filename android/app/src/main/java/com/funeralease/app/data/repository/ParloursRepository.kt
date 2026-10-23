package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.NotificationSettingsDto
import com.funeralease.app.data.api.ParlourDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ParloursRepository @Inject constructor(
    private val api: ApiService,
) {
    suspend fun search(area: String? = null, province: String? = null): List<ParlourDto> {
        val params = buildMap<String, String> {
            if (!area.isNullOrBlank()) put("area", area)
            if (!province.isNullOrBlank()) put("province", province)
        }
        return api.getParlours(params)
    }
}

@Singleton
class NotificationsRepository @Inject constructor(
    private val api: ApiService,
    private val auth: AuthRepository,
) {
    suspend fun getSettings(): NotificationSettingsDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.getNotificationSettings(token)
    }

    suspend fun updateSettings(settings: NotificationSettingsDto): NotificationSettingsDto {
        val token = auth.bearerToken() ?: error("Not authenticated")
        return api.updateNotificationSettings(token, settings)
    }
}
