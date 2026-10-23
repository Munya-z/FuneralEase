import {
  clearTokens,
  getRefreshToken,
  getStoredName,
  setTokens,
} from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:5001";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

/** Single-flight refresh so parallel 401s share one refresh call. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          clearTokens();
          return null;
        }
        const data = (await res.json()) as TokenPair;
        setTokens(data.accessToken, data.refreshToken, getStoredName() ?? undefined);
        return data.accessToken;
      } catch {
        clearTokens();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string; _retried?: boolean },
): Promise<T> {
  const { token, _retried, ...init } = options ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  // Expired access token → refresh once and retry (skip auth endpoints)
  if (res.status === 401 && token && !_retried && !path.startsWith("/auth/")) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiFetch<T>(path, { ...options, token: nextToken, _retried: true });
    }
    throw new ApiError(401, "Your session expired. Please sign in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      res.status === 401
        ? "Your session expired. Please sign in again."
        : (body.detail ?? body.title ?? `Request failed (${res.status})`);
    throw new ApiError(res.status, message);
  }

  const contentLength = res.headers.get("content-length");
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 204 || contentLength === "0" || !contentType.includes("application/json")) {
    return undefined as T;
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PolicyDocumentDto {
  storageKey: string;
  originalFileName: string;
  contentType: string;
  uploadedAt: string;
}

export interface PolicyDto {
  id: string;
  householdId: string;
  insurerName: string;
  policyNumber: string;
  premiumAmount: number;
  nextDueDate: string;
  lapseStatus: "Current" | "DueSoon" | "Overdue" | "Lapsed";
  createdAt: string;
  updatedAt: string;
  beneficiaries: { id: string; fullName: string; relationship: string; benefitPercentage: number }[];
  documents: PolicyDocumentDto[];
}

export interface ClaimDocumentDto {
  storageKey: string;
  originalFileName: string;
  contentType: string;
  uploadedAt: string;
}

export interface ClaimDto {
  id: string;
  policyId: string;
  householdId: string;
  deceasedFullName: string;
  status: "InProgress" | "Submitted" | "UnderReview" | "Approved" | "Rejected";
  createdAt: string;
  submittedAt?: string;
  checklistItems: ChecklistItemDto[];
  documents: ClaimDocumentDto[];
}

export interface ChecklistItemDto {
  id: string;
  description: string;
  itemType: "Required" | "Optional";
  isChecked: boolean;
}

export interface EmergencySessionDto {
  id: string;
  householdId: string;
  contacts: EmergencyContactDto[];
  activeGrants: AccessGrantDto[];
}

export interface EmergencyContactDto {
  id: string;
  fullName: string;
  mobileNumber: string;
  relationship: string;
  accessMode: "Immediate" | "Delayed";
}

export interface AccessGrantDto {
  id: string;
  contactId: string;
  activatesAt: string;
  expiresAt: string;
  isRevoked: boolean;
  isActive: boolean;
}

export interface SubscriptionDto {
  id: string;
  householdId: string;
  tier: "Free" | "Individual" | "Family" | "BurialSociety";
  channel: string;
  entitlementExpiresAt?: string;
  trialEndsAt?: string;
  isInTrial: boolean;
  isActive: boolean;
}

export interface ReferralDto {
  householdId: string;
  householdName: string;
  referralCode: string;
  referralLink: string;
  conversionsCount: number;
}

export interface ReferralConversionDto {
  householdName: string;
  joinedAt: string;
}

export interface ParlourDto {
  id: string;
  name: string;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  area: string;
  province: string;
  description?: string;
  status: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  requestOtp: (mobileNumber: string) =>
    apiFetch("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ mobileNumber }),
    }),

  verifyOtp: (mobileNumber: string, code: string, fullName: string, popiaConsentGiven: boolean) =>
    apiFetch<TokenPair>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ mobileNumber, code, fullName, popiaConsentGiven }),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<TokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  loginWithPin: (mobileNumber: string, pin: string) =>
    apiFetch<TokenPair>("/auth/pin/login", {
      method: "POST",
      body: JSON.stringify({ mobileNumber, pin }),
    }),

  setPin: (token: string, pin: string) =>
    apiFetch<void>("/auth/pin/set", {
      method: "POST",
      token,
      body: JSON.stringify({ pin }),
    }),
};

// ── Policies ──────────────────────────────────────────────────────────────────

export const policies = {
  list: (token: string) =>
    apiFetch<PolicyDto[]>("/policies", { token }),

  create: (
    token: string,
    data: {
      insurerName: string;
      policyNumber: string;
      premiumAmount: number;
      nextDueDate: string;
    },
  ) =>
    apiFetch<PolicyDto>("/policies", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  update: (
    token: string,
    policyId: string,
    data: { insurerName: string; policyNumber: string; premiumAmount: number; nextDueDate: string },
  ) =>
    apiFetch<PolicyDto>(`/policies/${policyId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),

  markPaid: (token: string, policyId: string, paidForDate: string) =>
    apiFetch(`/policies/${policyId}/mark-paid`, {
      method: "POST",
      token,
      body: JSON.stringify({ paidForDate }),
    }),

  addBeneficiary: (
    token: string,
    policyId: string,
    fullName: string,
    relationship: string,
    benefitPercentage: number,
  ) =>
    apiFetch<PolicyDto>(`/policies/${policyId}/beneficiaries`, {
      method: "POST",
      token,
      body: JSON.stringify({ fullName, relationship, benefitPercentage }),
    }),

  removeBeneficiary: (token: string, policyId: string, beneficiaryId: string) =>
    apiFetch<PolicyDto>(`/policies/${policyId}/beneficiaries/${beneficiaryId}`, {
      method: "DELETE",
      token,
    }),

  requestDocumentUpload: (token: string, policyId: string, fileName: string, contentType: string) =>
    apiFetch<{ uploadUrl: string; storageKey: string }>(`/policies/${policyId}/documents`, {
      method: "POST",
      token,
      body: JSON.stringify({ fileName, contentType }),
    }),

  getDocumentDownloadUrl: (token: string, policyId: string, storageKey: string) =>
    apiFetch<{ downloadUrl: string; expiresAt: string }>(
      `/policies/${policyId}/documents/download-url?${new URLSearchParams({ storageKey })}`,
      { token },
    ),

  getPaymentHistory: (token: string, policyId: string) =>
    apiFetch<PaymentHistoryEntryDto[]>(`/policies/${policyId}/payment-history`, { token }),
};

export interface PaymentHistoryEntryDto {
  id: string;
  amountPaid: number;
  paidForDate: string;
  recordedAt: string;
}

// ── Claims ────────────────────────────────────────────────────────────────────

export const claims = {
  list: (token: string) =>
    apiFetch<ClaimDto[]>("/claims", { token }),

  create: (token: string, policyId: string, deceasedFullName: string) =>
    apiFetch<ClaimDto>("/claims", {
      method: "POST",
      token,
      body: JSON.stringify({ policyId, deceasedFullName }),
    }),

  getChecklist: (token: string, claimId: string) =>
    apiFetch<ClaimDto>(`/claims/${claimId}/checklist`, { token }),

  updateItem: (token: string, claimId: string, itemId: string, isChecked: boolean) =>
    apiFetch(`/claims/${claimId}/checklist/${itemId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ isChecked }),
    }),

  complete: (token: string, claimId: string) =>
    apiFetch(`/claims/${claimId}/complete`, { method: "POST", token }),

  requestDocumentUpload: (token: string, claimId: string, fileName: string, contentType: string) =>
    apiFetch<{ uploadUrl: string; storageKey: string }>(`/claims/${claimId}/documents`, {
      method: "POST",
      token,
      body: JSON.stringify({ fileName, contentType }),
    }),

  getDocumentDownloadUrl: (token: string, claimId: string, storageKey: string) =>
    apiFetch<{ downloadUrl: string; expiresAt: string }>(
      `/claims/${claimId}/documents/download-url?${new URLSearchParams({ storageKey })}`,
      { token },
    ),
};

// ── Emergency Access ──────────────────────────────────────────────────────────

export const emergency = {
  getSession: (token: string) =>
    apiFetch<EmergencySessionDto>("/emergency-access", { token }),

  upsertContacts: (
    token: string,
    contacts: { fullName: string; mobileNumber: string; relationship: string; accessMode?: "Immediate" | "Delayed" }[],
  ) =>
    apiFetch<EmergencySessionDto>("/emergency-access/contacts", {
      method: "POST",
      token,
      body: JSON.stringify({ contacts }),
    }),

  requestGrant: (token: string, contactId: string) =>
    apiFetch<AccessGrantDto>("/emergency-access/request", {
      method: "POST",
      token,
      body: JSON.stringify({ contactId }),
    }),

  revokeGrant: (token: string, grantId: string) =>
    apiFetch(`/emergency-access/grants/${grantId}/revoke`, {
      method: "POST",
      token,
    }),
};

// ── Subscription ──────────────────────────────────────────────────────────────

export interface InitializePaymentResult {
  authorizationUrl: string;
  reference: string;
}

export const subscriptions = {
  get: (token: string, householdId: string) =>
    apiFetch<SubscriptionDto>(`/subscriptions/${householdId}`, { token }),

  /** Returns a Paystack checkout URL. Redirect the user there to complete payment. */
  upgrade: (token: string, householdId: string, tier: string, email: string, callbackUrl?: string) =>
    apiFetch<InitializePaymentResult>(`/subscriptions/${householdId}/upgrade`, {
      method: "POST",
      token,
      body: JSON.stringify({ tier, email, callbackUrl }),
    }),

  /** Confirms Paystack payment by reference and upgrades the plan (callback-url flow). */
  verify: (token: string, householdId: string, reference: string) =>
    apiFetch<SubscriptionDto>(`/subscriptions/${householdId}/verify`, {
      method: "POST",
      token,
      body: JSON.stringify({ reference }),
    }),
};

export interface MemberDto {
  userId: string;
  fullName: string;
  mobileNumber: string;
  role: string;
  joinedAt: string;
}

// ── Households ────────────────────────────────────────────────────────────────

export const households = {
  getReferral: (token: string, householdId: string) =>
    apiFetch<ReferralDto>(`/households/${householdId}/referral`, { token }),

  getReferralConversions: (token: string, householdId: string) =>
    apiFetch<ReferralConversionDto[]>(`/households/${householdId}/referral/conversions`, { token }),

  joinWithReferral: (token: string, referralCode: string) =>
    apiFetch("/households/join", {
      method: "POST",
      token,
      body: JSON.stringify({ referralCode }),
    }),

  exportData: (token: string, householdId: string) =>
    apiFetch<unknown>(`/households/${householdId}/data-export`, { token }),

  deleteAccount: (token: string, householdId: string) =>
    apiFetch(`/households/${householdId}`, { method: "DELETE", token }),

  getMembers: (token: string, householdId: string) =>
    apiFetch<MemberDto[]>(`/households/${householdId}/members`, { token }),

  addMember: (token: string, householdId: string, mobileNumber: string, fullName: string) =>
    apiFetch(`/households/${householdId}/members`, {
      method: "POST",
      token,
      body: JSON.stringify({ mobileNumber, fullName }),
    }),

  removeMember: (token: string, householdId: string, userId: string) =>
    apiFetch(`/households/${householdId}/members/${userId}`, {
      method: "DELETE",
      token,
    }),
};

export interface BurialSocietyMemberDto {
  id: string;
  householdId: string;
  fullName: string;
  mobileNumber: string;
  joinedAt: string;
}

export interface ContributionRecordDto {
  id: string;
  memberId: string;
  amountPaid: number;
  period: string;
  recordedAt: string;
  note: string | null;
}

export interface BurialSocietyDto {
  id: string;
  name: string;
  registrationNumber: string | null;
  adminHouseholdId: string;
  monthlyContributionAmount: number;
  members: BurialSocietyMemberDto[];
  recentContributions: ContributionRecordDto[];
}

// ── Burial Societies ──────────────────────────────────────────────────────────

export const burialSocieties = {
  getMy: (token: string) =>
    apiFetch<BurialSocietyDto>("/burial-societies/my", { token }),

  create: (token: string, data: { name: string; monthlyContributionAmount: number; registrationNumber?: string }) =>
    apiFetch<BurialSocietyDto>("/burial-societies", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  addMember: (token: string, societyId: string, data: { memberHouseholdId: string; fullName: string; mobileNumber: string }) =>
    apiFetch<BurialSocietyDto>(`/burial-societies/${societyId}/members`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  recordContribution: (token: string, societyId: string, data: { memberId: string; amountPaid: number; period: string; note?: string }) =>
    apiFetch<BurialSocietyDto>(`/burial-societies/${societyId}/contributions`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  getMyContributions: (token: string, societyId: string) =>
    apiFetch<MyContributionsResult>(`/burial-societies/${societyId}/my-contributions`, { token }),
};

export interface MyContributionDto {
  period: string;
  amountPaid: number;
  recordedAt: string;
  note: string | null;
}

export interface MyContributionsResult {
  societyId: string;
  societyName: string;
  memberId: string;
  memberName: string;
  monthlyContributionAmount: number;
  contributions: MyContributionDto[];
}

export interface NotificationSettingsDto {
  premiumDue: boolean;
  premiumOverdue: boolean;
  lapseWarning: boolean;
  claimUpdates: boolean;
  emergencyAccess: boolean;
  referralJoins: boolean;
}

// ── Notification Settings ─────────────────────────────────────────────────────

export const notifications = {
  getSettings: (token: string) =>
    apiFetch<NotificationSettingsDto>("/notification-settings", { token }),

  updateSettings: (token: string, settings: NotificationSettingsDto) =>
    apiFetch<NotificationSettingsDto>("/notification-settings", {
      method: "PUT",
      token,
      body: JSON.stringify(settings),
    }),
};

// ── Content ───────────────────────────────────────────────────────────────────

export const content = {
  getGriefSupport: () => apiFetch<unknown>("/content/grief-support"),
  getRepatriationGuide: () => apiFetch<unknown>("/content/repatriation-guide"),
};

// ── Funeral Wishes ────────────────────────────────────────────────────────────

export interface WishesDto {
  burialType?: string;
  ceremonyType?: string;
  musicPreferences?: string;
  readingPreferences?: string;
  legacyMessage?: string;
  specialRequests?: string;
  preferredParlourName?: string;
  donationsInLieuOf?: string;
}

export const wishes = {
  get: (token: string) =>
    apiFetch<WishesDto>("/wishes", { token }),

  upsert: (token: string, data: WishesDto) =>
    apiFetch<WishesDto>("/wishes", {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),
};

// ── Digital Vault ─────────────────────────────────────────────────────────────

export interface DigitalVaultItemDto {
  id: string;
  category: string;
  serviceName: string;
  username?: string;
  notes?: string;
  url?: string;
  onDeathInstruction: string;
  createdAt: string;
}

export const digitalVault = {
  list: (token: string) =>
    apiFetch<DigitalVaultItemDto[]>("/digital-vault", { token }),

  create: (token: string, data: { category: string; serviceName: string; username?: string; notes?: string; url?: string; onDeathInstruction: string }) =>
    apiFetch<DigitalVaultItemDto>("/digital-vault", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  update: (token: string, id: string, data: { category?: string; serviceName?: string; username?: string; notes?: string; url?: string; onDeathInstruction?: string }) =>
    apiFetch<DigitalVaultItemDto>(`/digital-vault/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: string) =>
    apiFetch(`/digital-vault/${id}`, { method: "DELETE", token }),
};

// ── Fundraisers ───────────────────────────────────────────────────────────────

export interface ContributionDto {
  id: string;
  donorName: string;
  amountCents: number;
  message?: string | null;
  donatedAt: string;
}

/** List / create / close summary (matches API FundraiserDto). */
export interface FundraiserDto {
  id: string;
  householdId: string;
  title: string;
  story: string;
  goalAmount: number;
  totalCollected: number;
  status: "Active" | "Closed" | string;
  deceasedFullName: string;
  createdAt: string;
  contributionCount: number;
}

/** Public detail (matches API FundraiserDetailDto). */
export interface FundraiserDetailDto extends FundraiserDto {
  contributions: ContributionDto[];
}

export const fundraisers = {
  list: (token: string) =>
    apiFetch<FundraiserDto[]>("/fundraisers", { token }),

  create: (token: string, data: { title: string; story: string; goalAmount: number; deceasedFullName: string }) =>
    apiFetch<FundraiserDto>("/fundraisers", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    apiFetch<FundraiserDetailDto>(`/fundraisers/${id}`),

  contribute: (id: string, data: { donorName: string; amountCents: number; message?: string }) =>
    apiFetch<ContributionDto>(`/fundraisers/${id}/contribute`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  close: (token: string, id: string) =>
    apiFetch<FundraiserDto>(`/fundraisers/${id}/close`, { method: "POST", token }),
};

// ── Estate Checklist ──────────────────────────────────────────────────────────

export interface EstateTaskDto {
  id: string;
  title: string;
  description: string;
  category: string;
  isCompleted: boolean;
  isCustom: boolean;
}

export interface EstateChecklistDto {
  id: string;
  deceasedFullName: string;
  dateOfDeath: string;
  tasks: EstateTaskDto[];
  createdAt: string;
}

export const estateChecklist = {
  get: (token: string) =>
    apiFetch<EstateChecklistDto>("/estate-checklist", { token }),

  create: (token: string, data: { deceasedFullName: string; dateOfDeath: string }) =>
    apiFetch<EstateChecklistDto>("/estate-checklist", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  completeTask: (token: string, taskId: string, isCompleted: boolean) =>
    apiFetch<EstateTaskDto>(`/estate-checklist/tasks/${taskId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ isCompleted }),
    }),

  addTask: (token: string, data: { title: string; description: string; category: string }) =>
    apiFetch<EstateTaskDto>("/estate-checklist/tasks", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
};

// ── Legal Directory ───────────────────────────────────────────────────────────

export interface LegalPractitionerDto {
  id: string;
  practiceType: string;
  firmName: string;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  area: string;
  province: string;
  description: string;
  website?: string;
  status: string;
}

export const legalDirectory = {
  search: (params?: { area?: string; province?: string; practiceType?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<LegalPractitionerDto[]>(`/legal-directory${q ? `?${q}` : ""}`);
  },

  submit: (data: { practiceType: string; firmName: string; contactName: string; phoneNumber: string; emailAddress: string; area: string; province: string; description: string; website?: string }) =>
    apiFetch<LegalPractitionerDto>("/legal-directory", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Grief Journal ─────────────────────────────────────────────────────────────

export interface GriefJournalEntryDto {
  id: string;
  content: string;
  mood: string;
  createdAt: string;
  updatedAt: string;
}

export const griefJournal = {
  list: (token: string) =>
    apiFetch<GriefJournalEntryDto[]>("/grief-journal", { token }),

  create: (token: string, data: { content: string; mood: string }) =>
    apiFetch<GriefJournalEntryDto>("/grief-journal", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  update: (token: string, id: string, data: { content: string; mood: string }) =>
    apiFetch<GriefJournalEntryDto>(`/grief-journal/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: string) =>
    apiFetch(`/grief-journal/${id}`, { method: "DELETE", token }),
};

// ── Obituary ──────────────────────────────────────────────────────────────────

export interface ObituaryDto {
  id: string;
  householdId: string;
  deceasedFullName: string;
  content: string;
  isAiGenerated: boolean;
  generatedAt: string;
  isPublished: boolean;
}

export const obituary = {
  get: (token: string) =>
    apiFetch<ObituaryDto>("/obituary", { token }),

  generate: (token: string, data: { deceasedFullName: string; ageAtDeath?: number; dateOfBirth?: string; dateOfDeath?: string; occupation?: string; hometown?: string; survivedBy?: string; lifeHighlights?: string; tonePreference?: string }) =>
    apiFetch<ObituaryDto>("/obituary/generate", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  save: (token: string, data: { deceasedFullName: string; content: string }) =>
    apiFetch<ObituaryDto>("/obituary", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
};

// ── Coverage Analysis ─────────────────────────────────────────────────────────

export interface CoverageAnalysisDto {
  totalPolicies: number;
  totalMonthlyPremium: number;
  totalEstimatedCover: number;
  averageFuneralCost: number;
  estimatedGap: number;
  hasCoverageGap: boolean;
  activePoliciesCount: number;
  lapsedPoliciesCount: number;
  policyStatusBreakdown: Record<string, number>;
}

export const coverageAnalysis = {
  get: (token: string) =>
    apiFetch<CoverageAnalysisDto>("/policies/coverage-analysis", { token }),
};

// ── Parlours (public) ─────────────────────────────────────────────────────────

export const parlours = {
  search: (area?: string, province?: string) => {
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (province) params.set("province", province);
    return apiFetch<ParlourDto[]>(`/parlours?${params}`);
  },

  submit: (data: {
    name: string;
    contactName: string;
    phoneNumber: string;
    emailAddress: string;
    area: string;
    province: string;
    description?: string;
  }) =>
    apiFetch<ParlourDto>("/parlours", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
