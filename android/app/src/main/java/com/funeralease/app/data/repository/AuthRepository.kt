package com.funeralease.app.data.repository

import com.funeralease.app.data.api.ApiService
import com.funeralease.app.data.api.PinLoginRequest
import com.funeralease.app.data.api.RefreshRequest
import com.funeralease.app.data.api.RequestOtpRequest
import com.funeralease.app.data.api.SetPinRequest
import com.funeralease.app.data.api.VerifyOtpRequest
import com.funeralease.app.data.local.SessionStore
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: ApiService,
    private val session: SessionStore,
) {
    suspend fun requestOtp(mobileNumber: String) {
        api.requestOtp(RequestOtpRequest(mobileNumber))
    }

    suspend fun verifyOtp(
        mobileNumber: String,
        code: String,
        fullName: String,
        popiaConsentGiven: Boolean,
    ): String {
        val tokens = api.verifyOtp(VerifyOtpRequest(mobileNumber, code, fullName, popiaConsentGiven))
        session.saveSession(tokens.accessToken, tokens.refreshToken)
        session.saveName(fullName)
        session.saveMobileNumber(mobileNumber)
        return tokens.accessToken
    }

    suspend fun setPin(accessToken: String, pin: String) {
        api.setPin("Bearer $accessToken", SetPinRequest(pin))
    }

    suspend fun loginWithPin(pin: String): String {
        val phone = session.mobileNumber.firstOrNull() ?: error("No saved phone number")
        val tokens = api.pinLogin(PinLoginRequest(phone, pin))
        session.saveSession(tokens.accessToken, tokens.refreshToken)
        return tokens.accessToken
    }

    suspend fun savedMobileNumber(): String? = session.mobileNumber.firstOrNull()
    suspend fun savedName(): String? = session.fullName.firstOrNull()

    suspend fun refreshSession(): Boolean {
        val refreshToken = session.refreshToken.firstOrNull() ?: return false
        return try {
            val tokens = api.refresh(RefreshRequest(refreshToken))
            session.saveSession(tokens.accessToken, tokens.refreshToken)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun isLoggedIn(): Boolean =
        session.accessToken.firstOrNull() != null

    suspend fun logout() = session.clear()

    suspend fun bearerToken(): String? =
        session.accessToken.firstOrNull()?.let { "Bearer $it" }
}
