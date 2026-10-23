package com.funeralease.app.data.api

import com.squareup.moshi.Json
import retrofit2.http.*

// ── Auth ──────────────────────────────────────────────────────────────────────

data class RequestOtpRequest(@Json(name = "mobileNumber") val mobileNumber: String)

data class VerifyOtpRequest(
    @Json(name = "mobileNumber") val mobileNumber: String,
    @Json(name = "code") val code: String,
    @Json(name = "fullName") val fullName: String,
    @Json(name = "popiaConsentGiven") val popiaConsentGiven: Boolean,
)

data class TokenPair(
    @Json(name = "accessToken") val accessToken: String,
    @Json(name = "refreshToken") val refreshToken: String,
    @Json(name = "expiresInSeconds") val expiresInSeconds: Long,
)

data class RefreshRequest(@Json(name = "refreshToken") val refreshToken: String)

data class SetPinRequest(@Json(name = "pin") val pin: String)

data class PinLoginRequest(
    @Json(name = "mobileNumber") val mobileNumber: String,
    @Json(name = "pin") val pin: String,
)

// ── Policies ──────────────────────────────────────────────────────────────────

data class PolicyDto(
    @Json(name = "id") val id: String,
    @Json(name = "householdId") val householdId: String,
    @Json(name = "insurerName") val insurerName: String,
    @Json(name = "policyNumber") val policyNumber: String,
    @Json(name = "premiumAmount") val premiumAmount: Double,
    @Json(name = "nextDueDate") val nextDueDate: String,
    @Json(name = "lapseStatus") val lapseStatus: String,
    @Json(name = "createdAt") val createdAt: String,
    @Json(name = "beneficiaries") val beneficiaries: List<BeneficiaryDto> = emptyList(),
)

data class BeneficiaryDto(
    @Json(name = "id") val id: String,
    @Json(name = "fullName") val fullName: String,
    @Json(name = "relationship") val relationship: String,
    @Json(name = "benefitPercentage") val benefitPercentage: Double,
)

data class CreatePolicyRequest(
    @Json(name = "insurerName") val insurerName: String,
    @Json(name = "policyNumber") val policyNumber: String,
    @Json(name = "premiumAmount") val premiumAmount: Double,
    @Json(name = "nextDueDate") val nextDueDate: String,
)

// ── Claims ────────────────────────────────────────────────────────────────────

data class ClaimDto(
    @Json(name = "id") val id: String,
    @Json(name = "policyId") val policyId: String,
    @Json(name = "deceasedFullName") val deceasedFullName: String,
    @Json(name = "status") val status: String,
    @Json(name = "createdAt") val createdAt: String,
    @Json(name = "checklistItems") val checklistItems: List<ChecklistItemDto> = emptyList(),
)

data class ChecklistItemDto(
    @Json(name = "id") val id: String,
    @Json(name = "description") val description: String,
    @Json(name = "itemType") val itemType: String,
    @Json(name = "isChecked") val isChecked: Boolean,
)

data class CreateClaimRequest(
    @Json(name = "policyId") val policyId: String,
    @Json(name = "deceasedFullName") val deceasedFullName: String,
)

// ── Emergency Access ──────────────────────────────────────────────────────────

data class EmergencySessionDto(
    @Json(name = "id") val id: String,
    @Json(name = "householdId") val householdId: String,
    @Json(name = "contacts") val contacts: List<EmergencyContactDto> = emptyList(),
    @Json(name = "activeGrants") val activeGrants: List<AccessGrantDto> = emptyList(),
)

data class EmergencyContactDto(
    @Json(name = "id") val id: String,
    @Json(name = "fullName") val fullName: String,
    @Json(name = "mobileNumber") val mobileNumber: String,
    @Json(name = "relationship") val relationship: String,
    @Json(name = "accessMode") val accessMode: String,
)

data class AccessGrantDto(
    @Json(name = "id") val id: String,
    @Json(name = "contactId") val contactId: String,
    @Json(name = "isActive") val isActive: Boolean,
    @Json(name = "expiresAt") val expiresAt: String,
)

// ── Subscription ──────────────────────────────────────────────────────────────

data class SubscriptionDto(
    @Json(name = "id") val id: String,
    @Json(name = "householdId") val householdId: String,
    @Json(name = "tier") val tier: String,
    @Json(name = "isInTrial") val isInTrial: Boolean,
    @Json(name = "isActive") val isActive: Boolean,
    @Json(name = "trialEndsAt") val trialEndsAt: String?,
)

// ── Household Members ─────────────────────────────────────────────────────────

data class MemberDto(
    @Json(name = "userId") val userId: String,
    @Json(name = "fullName") val fullName: String,
    @Json(name = "mobileNumber") val mobileNumber: String,
    @Json(name = "role") val role: String,
    @Json(name = "joinedAt") val joinedAt: String,
)

// ── Burial Society ────────────────────────────────────────────────────────────

data class BurialSocietyDto(
    @Json(name = "id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "monthlyContributionAmount") val monthlyContributionAmount: Double,
    @Json(name = "members") val members: List<BurialSocietyMemberDto> = emptyList(),
    @Json(name = "recentContributions") val recentContributions: List<ContributionRecordDto> = emptyList(),
)

data class BurialSocietyMemberDto(
    @Json(name = "id") val id: String,
    @Json(name = "fullName") val fullName: String,
    @Json(name = "mobileNumber") val mobileNumber: String,
    @Json(name = "joinedAt") val joinedAt: String,
)

data class ContributionRecordDto(
    @Json(name = "id") val id: String,
    @Json(name = "memberId") val memberId: String,
    @Json(name = "amountPaid") val amountPaid: Double,
    @Json(name = "period") val period: String,
    @Json(name = "recordedAt") val recordedAt: String,
)

// ── Digital Vault ─────────────────────────────────────────────────────────────

data class DigitalAssetDto(
    @Json(name = "id") val id: String,
    @Json(name = "category") val category: String,
    @Json(name = "serviceName") val serviceName: String,
    @Json(name = "username") val username: String?,
    @Json(name = "notes") val notes: String?,
    @Json(name = "url") val url: String?,
    @Json(name = "onDeathInstruction") val onDeathInstruction: String,
    @Json(name = "createdAt") val createdAt: String,
)

// ── Funeral Wishes ────────────────────────────────────────────────────────────

data class WishesDto(
    @Json(name = "burialType") val burialType: String?,
    @Json(name = "ceremonyType") val ceremonyType: String?,
    @Json(name = "musicPreferences") val musicPreferences: String?,
    @Json(name = "readingPreferences") val readingPreferences: String?,
    @Json(name = "legacyMessage") val legacyMessage: String?,
    @Json(name = "specialRequests") val specialRequests: String?,
)

// ── Grief Journal ─────────────────────────────────────────────────────────────

data class GriefJournalEntryDto(
    @Json(name = "id") val id: String,
    @Json(name = "content") val content: String,
    @Json(name = "mood") val mood: String,
    @Json(name = "createdAt") val createdAt: String,
    @Json(name = "updatedAt") val updatedAt: String,
)

// ── Parlours ──────────────────────────────────────────────────────────────────

data class ParlourDto(
    @Json(name = "id") val id: String,
    @Json(name = "name") val name: String,
    @Json(name = "contactName") val contactName: String,
    @Json(name = "phoneNumber") val phoneNumber: String,
    @Json(name = "area") val area: String,
    @Json(name = "province") val province: String,
    @Json(name = "description") val description: String?,
)

// ── Notification Settings ─────────────────────────────────────────────────────

data class NotificationSettingsDto(
    @Json(name = "premiumDue") val premiumDue: Boolean,
    @Json(name = "premiumOverdue") val premiumOverdue: Boolean,
    @Json(name = "lapseWarning") val lapseWarning: Boolean,
    @Json(name = "claimUpdates") val claimUpdates: Boolean,
    @Json(name = "emergencyAccess") val emergencyAccess: Boolean,
    @Json(name = "referralJoins") val referralJoins: Boolean,
)

// ── Referral ──────────────────────────────────────────────────────────────────

data class ReferralDto(
    @Json(name = "householdId") val householdId: String,
    @Json(name = "householdName") val householdName: String,
    @Json(name = "referralCode") val referralCode: String,
    @Json(name = "referralLink") val referralLink: String,
    @Json(name = "conversionsCount") val conversionsCount: Int,
)

// ── API Interface ─────────────────────────────────────────────────────────────

interface ApiService {

    // Auth
    @POST("auth/otp/request")
    suspend fun requestOtp(@Body body: RequestOtpRequest)

    @POST("auth/otp/verify")
    suspend fun verifyOtp(@Body body: VerifyOtpRequest): TokenPair

    @POST("auth/refresh")
    suspend fun refresh(@Body body: RefreshRequest): TokenPair

    @POST("auth/pin/set")
    suspend fun setPin(@Header("Authorization") token: String, @Body body: SetPinRequest)

    @POST("auth/pin/login")
    suspend fun pinLogin(@Body body: PinLoginRequest): TokenPair

    // Policies
    @GET("policies")
    suspend fun getPolicies(@Header("Authorization") token: String): List<PolicyDto>

    @POST("policies")
    suspend fun createPolicy(@Header("Authorization") token: String, @Body body: CreatePolicyRequest): PolicyDto

    @PATCH("policies/{id}")
    suspend fun updatePolicy(@Header("Authorization") token: String, @Path("id") id: String, @Body body: CreatePolicyRequest): PolicyDto

    @POST("policies/{id}/mark-paid")
    suspend fun markPaid(@Header("Authorization") token: String, @Path("id") policyId: String, @Body body: Map<String, String>)

    @POST("policies/{id}/beneficiaries")
    suspend fun addBeneficiary(@Header("Authorization") token: String, @Path("id") policyId: String, @Body body: Map<String, @JvmSuppressWildcards Any>): PolicyDto

    // Claims
    @GET("claims")
    suspend fun getClaims(@Header("Authorization") token: String): List<ClaimDto>

    @POST("claims")
    suspend fun createClaim(@Header("Authorization") token: String, @Body body: CreateClaimRequest): ClaimDto

    @GET("claims/{id}/checklist")
    suspend fun getClaimChecklist(@Header("Authorization") token: String, @Path("id") claimId: String): ClaimDto

    @PATCH("claims/{id}/checklist/{itemId}")
    suspend fun updateChecklistItem(@Header("Authorization") token: String, @Path("id") claimId: String, @Path("itemId") itemId: String, @Body body: Map<String, Boolean>)

    // Emergency Access
    @GET("emergency-access")
    suspend fun getEmergencySession(@Header("Authorization") token: String): EmergencySessionDto

    @POST("emergency-access/contacts")
    suspend fun upsertContacts(@Header("Authorization") token: String, @Body body: Map<String, @JvmSuppressWildcards Any>): EmergencySessionDto

    @POST("emergency-access/request")
    suspend fun requestGrant(@Header("Authorization") token: String, @Body body: Map<String, String>): AccessGrantDto

    @POST("emergency-access/grants/{grantId}/revoke")
    suspend fun revokeGrant(@Header("Authorization") token: String, @Path("grantId") grantId: String)

    // Households
    @GET("households/{id}/members")
    suspend fun getMembers(@Header("Authorization") token: String, @Path("id") householdId: String): List<MemberDto>

    @POST("households/{id}/members")
    suspend fun addMember(@Header("Authorization") token: String, @Path("id") householdId: String, @Body body: Map<String, String>)

    @GET("households/{id}/referral")
    suspend fun getReferral(@Header("Authorization") token: String, @Path("id") householdId: String): ReferralDto

    // Subscriptions
    @GET("subscriptions/{householdId}")
    suspend fun getSubscription(@Header("Authorization") token: String, @Path("householdId") householdId: String): SubscriptionDto

    // Burial Societies
    @GET("burial-societies/my")
    suspend fun getBurialSociety(@Header("Authorization") token: String): BurialSocietyDto

    @POST("burial-societies")
    suspend fun createBurialSociety(@Header("Authorization") token: String, @Body body: Map<String, @JvmSuppressWildcards Any>): BurialSocietyDto

    @POST("burial-societies/{id}/contributions")
    suspend fun recordContribution(@Header("Authorization") token: String, @Path("id") societyId: String, @Body body: Map<String, @JvmSuppressWildcards Any>): BurialSocietyDto

    // Digital Vault
    @GET("digital-vault")
    suspend fun getDigitalAssets(@Header("Authorization") token: String): List<DigitalAssetDto>

    @POST("digital-vault")
    suspend fun createDigitalAsset(@Header("Authorization") token: String, @Body body: Map<String, @JvmSuppressWildcards Any>): DigitalAssetDto

    @DELETE("digital-vault/{id}")
    suspend fun deleteDigitalAsset(@Header("Authorization") token: String, @Path("id") id: String)

    // Funeral Wishes
    @GET("wishes")
    suspend fun getWishes(@Header("Authorization") token: String): WishesDto

    @PUT("wishes")
    suspend fun upsertWishes(@Header("Authorization") token: String, @Body body: WishesDto): WishesDto

    // Grief Journal
    @GET("grief-journal")
    suspend fun getJournalEntries(@Header("Authorization") token: String): List<GriefJournalEntryDto>

    @POST("grief-journal")
    suspend fun createJournalEntry(@Header("Authorization") token: String, @Body body: Map<String, String>): GriefJournalEntryDto

    @DELETE("grief-journal/{id}")
    suspend fun deleteJournalEntry(@Header("Authorization") token: String, @Path("id") id: String)

    // Parlours
    @GET("parlours")
    suspend fun getParlours(@QueryMap params: Map<String, String> = emptyMap()): List<ParlourDto>

    // Notification Settings
    @GET("notification-settings")
    suspend fun getNotificationSettings(@Header("Authorization") token: String): NotificationSettingsDto

    @PUT("notification-settings")
    suspend fun updateNotificationSettings(@Header("Authorization") token: String, @Body body: NotificationSettingsDto): NotificationSettingsDto
}
