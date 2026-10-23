package com.funeralease.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "session")

@Singleton
class SessionStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    companion object {
        private val KEY_ACCESS_TOKEN   = stringPreferencesKey("access_token")
        private val KEY_REFRESH_TOKEN  = stringPreferencesKey("refresh_token")
        private val KEY_FULL_NAME      = stringPreferencesKey("full_name")
        private val KEY_HOUSEHOLD_ID   = stringPreferencesKey("household_id")
        private val KEY_MOBILE_NUMBER  = stringPreferencesKey("mobile_number")
    }

    val accessToken: Flow<String?>  = context.dataStore.data.map { it[KEY_ACCESS_TOKEN] }
    val refreshToken: Flow<String?> = context.dataStore.data.map { it[KEY_REFRESH_TOKEN] }
    val fullName: Flow<String?>     = context.dataStore.data.map { it[KEY_FULL_NAME] }
    val householdId: Flow<String?>  = context.dataStore.data.map { it[KEY_HOUSEHOLD_ID] }
    val mobileNumber: Flow<String?> = context.dataStore.data.map { it[KEY_MOBILE_NUMBER] }

    suspend fun saveSession(accessToken: String, refreshToken: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN]  = accessToken
            prefs[KEY_REFRESH_TOKEN] = refreshToken
        }
    }

    suspend fun saveMobileNumber(mobileNumber: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_MOBILE_NUMBER] = mobileNumber
        }
    }

    suspend fun saveName(fullName: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_FULL_NAME] = fullName
        }
    }

    suspend fun saveProfile(fullName: String, householdId: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_FULL_NAME]    = fullName
            prefs[KEY_HOUSEHOLD_ID] = householdId
        }
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }
}
