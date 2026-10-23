const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(path: string, token: string | null, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? body.title ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardDto {
  totalHouseholds: number;
  totalPolicies: number;
  activeSubscriptions: number;
  pendingParlours: number;
  openClaims: number;
  lapsedPolicies: number;
  tierBreakdown: { free: number; individual: number; family: number; burialSociety: number };
  estimatedMrr: number;
}

export interface HouseholdSummaryDto {
  householdId: string;
  name: string;
  referralCode: string;
  memberCount: number;
  policyCount: number;
  subscriptionTier: string;
  createdAt: string;
}

export interface SearchHouseholdsResult {
  items: HouseholdSummaryDto[];
  totalCount: number;
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

export interface BillingEventDto {
  id: string;
  channel: string;
  providerEventId: string;
  eventType: string;
  householdId: string;
  processedAt: string;
}

export interface GetBillingEventsResult {
  items: BillingEventDto[];
  totalCount: number;
}

export interface AuditLogEntryDto {
  id: string;
  actor: string;
  action: string;
  category: string;
  subject: string;
  detail: string | null;
  occurredAt: string;
}

export interface GetAuditLogResult {
  items: AuditLogEntryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminClaimSummaryDto {
  claimId: string;
  householdId: string;
  householdName: string;
  deceasedFullName: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
}

export interface GetAdminClaimsResult {
  items: AdminClaimSummaryDto[];
  totalCount: number;
}

export interface AdminClaimDetailDto {
  claimId: string;
  householdId: string;
  householdName: string;
  policyId: string;
  insurerName: string;
  policyNumber: string;
  deceasedFullName: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  checklistItems: { id: string; description: string; itemType: string; isChecked: boolean }[];
}

export interface BurialSocietySummaryDto {
  id: string;
  name: string;
  registrationNumber: string | null;
  adminHouseholdId: string;
  monthlyContributionAmount: number;
  memberCount: number;
  createdAt: string;
}

export interface GetBurialSocietiesResult {
  items: BurialSocietySummaryDto[];
  totalCount: number;
}

export interface AdminSocietyMemberDto {
  memberId: string;
  householdId: string;
  fullName: string;
  mobileNumber: string;
  joinedAt: string;
  contributionCount: number;
  totalContributed: number;
}

export interface AdminSocietyContributionDto {
  id: string;
  memberId: string;
  memberName: string;
  amountPaid: number;
  period: string;
  recordedAt: string;
  note: string | null;
}

export interface AdminBurialSocietyDetailDto {
  id: string;
  name: string;
  registrationNumber: string | null;
  adminHouseholdId: string;
  monthlyContributionAmount: number;
  createdAt: string;
  members: AdminSocietyMemberDto[];
  recentContributions: AdminSocietyContributionDto[];
}

export interface HouseholdMemberDetailDto {
  userId: string;
  fullName: string;
  mobileNumber: string;
  role: string;
  joinedAt: string;
}

export interface HouseholdPolicySummaryDto {
  policyId: string;
  insurerName: string;
  policyNumber: string;
  premiumAmount: number;
  nextDueDate: string;
  lapseStatus: string;
}

export interface HouseholdAuditEventDto {
  action: string;
  category: string;
  subject: string;
  detail: string | null;
  occurredAt: string;
}

export interface HouseholdDetailDto {
  householdId: string;
  name: string;
  referralCode: string;
  createdAt: string;
  subscriptionTier: string;
  isInTrial: boolean;
  trialEndsAt: string | null;
  entitlementExpiresAt: string | null;
  members: HouseholdMemberDetailDto[];
  policies: HouseholdPolicySummaryDto[];
  recentAuditEvents: HouseholdAuditEventDto[];
}

export interface OverrideSubscriptionResult {
  subscriptionId: string;
  householdId: string;
  tier: string;
  entitlementExpiresAt: string | null;
}

// ── Admin API calls ───────────────────────────────────────────────────────────

export interface StaffLoginResult {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export const auth = {
  staffLogin: (email: string, password: string, totp?: string) =>
    apiFetch<StaffLoginResult>("/auth/staff/login", null, {
      method: "POST",
      body: JSON.stringify({ email, password, totp: totp || null }),
    }),
};

export const admin = {
  getDashboard: (token: string) =>
    apiFetch<DashboardDto>("/admin/dashboard", token),

  searchHouseholds: (token: string, search?: string, tier?: string, page = 1) =>
    apiFetch<SearchHouseholdsResult>(
      `/admin/households?${new URLSearchParams({ ...(search ? { search } : {}), ...(tier ? { tier } : {}), page: String(page) })}`,
      token,
    ),

  getPendingParlours: (token: string) =>
    apiFetch<ParlourDto[]>("/admin/parlours/pending", token),

  moderateParlour: (token: string, parlourId: string, approve: boolean, rejectionReason?: string) =>
    apiFetch<ParlourDto>(`/admin/parlours/${parlourId}/moderate`, token, {
      method: "POST",
      body: JSON.stringify({ approve, rejectionReason }),
    }),

  getBillingEvents: (token: string, page = 1) =>
    apiFetch<GetBillingEventsResult>(`/admin/billing/events?page=${page}`, token),

  getAuditLog: (token: string, page = 1, category?: string) =>
    apiFetch<GetAuditLogResult>(
      `/admin/audit-log?${new URLSearchParams({ page: String(page), ...(category ? { category } : {}) })}`,
      token,
    ),

  getBurialSocieties: (token: string, page = 1) =>
    apiFetch<GetBurialSocietiesResult>(`/admin/burial-societies?page=${page}`, token),

  getHouseholdDetail: (token: string, householdId: string) =>
    apiFetch<HouseholdDetailDto>(`/admin/households/${householdId}`, token),

  getClaims: (token: string, status?: string, page = 1) =>
    apiFetch<GetAdminClaimsResult>(
      `/admin/claims?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page) })}`,
      token,
    ),

  getClaimDetail: (token: string, claimId: string) =>
    apiFetch<AdminClaimDetailDto>(`/admin/claims/${claimId}`, token),

  updateClaimStatus: (token: string, claimId: string, status: string) =>
    apiFetch(`/admin/claims/${claimId}/status`, token, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  overrideSubscription: (token: string, householdId: string, tier: string, expiresAt?: string) =>
    apiFetch<OverrideSubscriptionResult>(`/admin/households/${householdId}/subscription/override`, token, {
      method: "POST",
      body: JSON.stringify({ tier, expiresAt: expiresAt ?? null }),
    }),

  getBurialSocietyDetail: (token: string, societyId: string) =>
    apiFetch<AdminBurialSocietyDetailDto>(`/admin/burial-societies/${societyId}`, token),

  getPendingLegalProfessionals: (token: string) =>
    apiFetch<LegalProfessionalDto[]>("/admin/legal-directory/pending", token),

  moderateLegalProfessional: (token: string, id: string, approve: boolean, rejectionReason?: string) =>
    apiFetch<LegalProfessionalDto>(`/admin/legal-directory/${id}/moderate`, token, {
      method: "POST",
      body: JSON.stringify({ approve, rejectionReason }),
    }),
};

export interface LegalProfessionalDto {
  id: string;
  practiceType: string;
  firmName: string;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  area: string;
  province: string;
  website?: string;
  description: string;
  status: string;
  moderationNote?: string;
}
