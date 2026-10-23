"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { admin as adminApi, type HouseholdDetailDto, type OverrideSubscriptionResult } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const tierBadge: Record<string, string> = {
  Free: "bg-dusk-ink/8 text-dusk-ink/60",
  Individual: "bg-candlewick/10 text-candlewick",
  Family: "bg-sage/10 text-sage",
  BurialSociety: "bg-dusk-ink/8 text-dusk-ink",
};

const lapseColors: Record<string, string> = {
  Current: "text-sage",
  DueSoon: "text-candlewick",
  Overdue: "text-ember",
  Lapsed: "text-ember font-semibold",
};

const auditCategoryDot: Record<string, string> = {
  Emergency: "bg-ember",
  Moderation: "bg-candlewick",
  Billing: "bg-sage",
  Popia: "bg-dusk-ink/40",
  Society: "bg-dusk-ink",
  Auth: "bg-candlewick/60",
};

export default function HouseholdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<HouseholdDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overrideTier, setOverrideTier] = useState("");
  const [overriding, setOverriding] = useState(false);
  const [overrideError, setOverrideError] = useState("");
  const [overrideResult, setOverrideResult] = useState<OverrideSubscriptionResult | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    adminApi.getHouseholdDetail(token, id)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function applyOverride() {
    const token = getAdminToken();
    if (!token || !overrideTier) return;
    setOverriding(true);
    setOverrideError("");
    try {
      const result = await adminApi.overrideSubscription(token, id, overrideTier);
      setOverrideResult(result);
      // Refresh detail so header badge updates
      adminApi.getHouseholdDetail(token, id).then(setDetail).catch(() => null);
    } catch (e) {
      setOverrideError(e instanceof Error ? e.message : "Override failed");
    } finally {
      setOverriding(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 rounded bg-dusk-ink/8 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8">
        <p className="font-sans text-sm text-ember">{error || "Household not found."}</p>
        <Link href="/households" className="mt-3 inline-block font-sans text-xs text-dusk-ink/50 hover:text-dusk-ink">
          ← Back to households
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link href="/households" className="font-sans text-xs text-dusk-ink/40 hover:text-dusk-ink mb-2 inline-block">
          ← Households
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-dusk-ink">{detail.name}</h1>
            <p className="font-mono text-xs text-dusk-ink/40 mt-0.5">
              Referral: {detail.referralCode} · Joined {new Date(detail.createdAt).toLocaleDateString("en-ZA")}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 font-sans text-xs font-medium ${tierBadge[detail.subscriptionTier] ?? ""}`}>
            {detail.subscriptionTier}
            {detail.isInTrial && <span className="ml-1 opacity-60">(trial)</span>}
          </span>
        </div>
        {detail.entitlementExpiresAt && (
          <p className="font-sans text-xs text-dusk-ink/40 mt-1">
            Entitlement expires {new Date(detail.entitlementExpiresAt).toLocaleDateString("en-ZA")}
          </p>
        )}
        {detail.isInTrial && detail.trialEndsAt && (
          <p className="font-sans text-xs text-candlewick mt-1">
            Trial ends {new Date(detail.trialEndsAt).toLocaleDateString("en-ZA")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-dusk-ink/8">
            <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider">
              Members ({detail.members.length})
            </p>
          </div>
          {detail.members.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="font-sans text-sm text-dusk-ink/40">No members.</p>
            </div>
          ) : (
            <div className="divide-y divide-dusk-ink/5">
              {detail.members.map((m) => (
                <div key={m.userId} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm font-medium text-dusk-ink">{m.fullName}</p>
                    <p className="font-mono text-xs text-dusk-ink/40">{m.mobileNumber}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 font-sans text-xs font-medium ${
                    m.role === "Administrator" ? "bg-dusk-ink/10 text-dusk-ink" : "bg-dusk-ink/6 text-dusk-ink/50"
                  }`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Policies */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-dusk-ink/8">
            <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider">
              Policies ({detail.policies.length})
            </p>
          </div>
          {detail.policies.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="font-sans text-sm text-dusk-ink/40">No policies.</p>
            </div>
          ) : (
            <div className="divide-y divide-dusk-ink/5">
              {detail.policies.map((p) => (
                <div key={p.policyId} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm font-medium text-dusk-ink">{p.insurerName}</p>
                    <p className="font-mono text-xs text-dusk-ink/40">{p.policyNumber} · R{p.premiumAmount.toFixed(2)}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-sans text-xs font-medium ${lapseColors[p.lapseStatus] ?? "text-dusk-ink/50"}`}>
                      {p.lapseStatus}
                    </p>
                    <p className="font-mono text-xs text-dusk-ink/30">{p.nextDueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription override */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
        <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider mb-3">
          Subscription override
        </p>
        {overrideResult ? (
          <div className="rounded-xl bg-sage/10 ring-1 ring-sage/20 px-4 py-3">
            <p className="font-sans text-sm font-semibold text-sage">
              Tier set to <span className="font-mono">{overrideResult.tier}</span>
            </p>
            {overrideResult.entitlementExpiresAt && (
              <p className="font-sans text-xs text-dusk-ink/50 mt-0.5">
                Expires {new Date(overrideResult.entitlementExpiresAt).toLocaleDateString("en-ZA")}
              </p>
            )}
          </div>
        ) : (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block font-sans text-xs text-dusk-ink/50 mb-1">New tier</label>
              <select
                value={overrideTier}
                onChange={(e) => setOverrideTier(e.target.value)}
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              >
                <option value="">Select tier…</option>
                {["Free", "Individual", "Family", "BurialSociety"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button
              onClick={applyOverride}
              disabled={overriding || !overrideTier}
              className="rounded-xl bg-dusk-ink px-5 py-2.5 font-sans text-xs font-semibold text-warm-paper disabled:opacity-40"
            >
              {overriding ? "Applying…" : "Apply"}
            </button>
          </div>
        )}
        {overrideError && <p className="mt-2 font-sans text-xs text-ember">{overrideError}</p>}
        <p className="mt-2 font-sans text-xs text-dusk-ink/30">
          Sets a 30-day entitlement window. Bypasses billing provider.
        </p>
      </div>

      {/* Recent audit events */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-dusk-ink/8">
          <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider">
            Recent audit events
          </p>
        </div>
        {detail.recentAuditEvents.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-sans text-sm text-dusk-ink/40">No audit events yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-dusk-ink/5">
            {detail.recentAuditEvents.map((ev, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-4">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${auditCategoryDot[ev.category] ?? "bg-dusk-ink/20"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-dusk-ink">{ev.action}</span>
                    <span className="font-sans text-xs text-dusk-ink/40">{ev.category}</span>
                  </div>
                  {ev.detail && <p className="font-sans text-xs text-dusk-ink/50 mt-0.5">{ev.detail}</p>}
                  <p className="font-mono text-xs text-dusk-ink/30 mt-0.5">
                    {new Date(ev.occurredAt).toLocaleString("en-ZA")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
