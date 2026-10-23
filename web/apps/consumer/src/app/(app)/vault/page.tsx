"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { policies as policiesApi, subscriptions as subscriptionsApi, type PolicyDto, type SubscriptionDto } from "@/lib/api";
import { getToken, getHouseholdId } from "@/lib/auth";
import Button from "@/partials/buttons";
import { Text } from "@/partials/text";
import Input from "@/partials/form_inputs";

const statusMap: Record<PolicyDto["lapseStatus"], { label: string; className: string; dot: string }> = {
  Current: { label: "Paid", className: "text-sage bg-sage/10 border-sage/20", dot: "bg-sage" },
  DueSoon: { label: "Due soon", className: "text-candlewick bg-candlewick/10 border-candlewick/20", dot: "bg-candlewick" },
  Overdue: { label: "Overdue", className: "text-ember bg-ember/10 border-ember/20", dot: "bg-ember" },
  Lapsed: { label: "Lapsed", className: "text-white bg-ember border-ember", dot: "bg-ember" },
};

export default function VaultPage() {
  const [data, setData] = useState<PolicyDto[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    const householdId = getHouseholdId();
    if (!token) return;
    Promise.all([
      policiesApi.list(token),
      householdId ? subscriptionsApi.get(token, householdId).catch(() => null) : Promise.resolve(null),
    ])
      .then(([policies, sub]) => { setData(policies); setSubscription(sub); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPremium = data.reduce((s, p) => s + p.premiumAmount, 0);
  const atRisk = data.filter((p) => p.lapseStatus !== "Current").length;
  const canAddMore = !(!subscription || subscription.tier === "Free") || data.length === 0;

  return (
    <div className="w-full">
      <AppHeader
        title="Policy Vault"
        action={
          <Link
            href={canAddMore ? "/vault/add" : "#"}
            className={`flex items-center gap-2 rounded-bdr-inr px-4 py-2 font-sans text-sm font-semibold transition-colors ${canAddMore
              ? "bg-dusk-ink text-warm-paper hover:bg-dusk-ink/80"
              : "bg-dusk-ink/10 text-dusk-ink/30 cursor-not-allowed"
              }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add policy
          </Link>
        }
      />

      <div className="px-6 py-6 space-y-6">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text variant="body" color="light" >Policy Vault</Text>
          <Text variant="body_small" faded color="light">Store and organise all your funeral policies in one secure place.</Text>
        </div>

        {/* Summary cards */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border border-dusk-ink/8 px-5 py-4">
              <Text variant="body_sec" className="uppercase tracking-wider mb-2">Policies</Text>
              <Text variant="heading_sec" >{data.length}</Text>
            </div>
            <div className="rounded-2xl bg-white border border-dusk-ink/8 px-5 py-4">
              <Text variant="body_sec" className="uppercase mb-2">Monthly Total</Text>
              <Text variant="heading_sec" >R{totalPremium.toLocaleString()}</Text>
            </div>
            <div className="rounded-2xl bg-white border border-dusk-ink/8 px-5 py-4">
              <Text variant="body_sec" className=" uppercase mb-2">At Risk</Text>
              <Text variant="heading_sec" className={` text-3xl  ${atRisk > 0 ? "text-ember" : "text-sage"}`}>{atRisk}</Text>
            </div>
          </div>
        )}

        {/* Plan limit nudge */}
        {!loading && data.length >= 1 && (!subscription || subscription.tier === "Free") && (
          <div className="rounded-2xl bg-candlewick/10 border border-candlewick/20 px-5 py-4 flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-candlewick mt-0.5 flex-shrink-0">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex-1">
              <Text color="candle" >You&apos;ve reached your plan limit</Text>
              <Text faded variant="body_small" className="mt-0.5">
                The Free plan supports 1 policy. Upgrade to Individual or Family to add more.
              </Text>
              <Link href="/upgrade" className="mt-2 inline-block rounded-lg bg-candlewick px-3 py-1.5 font-sans text-xs font-semibold text-white">
                Upgrade plan
              </Link>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-dusk-ink/8 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-ember/10 border border-ember/20 px-5 py-4">
            <Text className="text-ember">{error}</Text>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="rounded-2xl bg-white border border-dusk-ink/8 flex flex-col items-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/30">
                <rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7V5.5C7 4.119 8.119 3 9.5 3H14.5C15.881 3 17 4.119 17 5.5V7" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <Text variant="heading_small" className="mb-2">No policies yet</Text>
            <Text faded className="mb-6">
              Add your first funeral policy to start tracking premiums and get lapse warnings.
            </Text>
            <Link href="/vault/add" >
              <Button>

                Add your first policy
              </Button>
            </Link>
          </div>
        )}

        {/* Policy list */}
        {!loading && data.length > 0 && (
          <div>
            <h2 className="font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider mb-3">All Policies</h2>
            <div className="space-y-3">
              {data.map((policy) => {
                const s = statusMap[policy.lapseStatus];
                return (
                  <div key={policy.id} className="rounded-2xl bg-white border border-dusk-ink/8 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Text >{policy.insurerName}</Text>
                          <Text as="span" className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5  ${s.className}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </Text>
                        </div>
                        <Text variant="body_small_sec" superFaded>{policy.policyNumber}</Text>
                        {policy.beneficiaries.length > 0 && (
                          <Text variant="body_small" className="mt-1" superFaded>
                            {policy.beneficiaries.length} beneficiar{policy.beneficiaries.length === 1 ? "y" : "ies"}:{" "}
                            {policy.beneficiaries.map((b) => b.fullName).join(", ")}
                          </Text>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Text variant="heading_sec" className="font-mono text-lg font-bold text-dusk-ink">R{policy.premiumAmount.toLocaleString()}</Text>
                        <Text variant="body_small_sec" superFaded>per month</Text>
                        <Text variant="body_small" superFaded >Due {policy.nextDueDate}</Text>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dusk-ink/8">
                      {policy.lapseStatus !== "Current" && (
                        <button
                          onClick={async () => {
                            const token = getToken();
                            if (!token) return;
                            await policiesApi.markPaid(token, policy.id, new Date().toISOString().split("T")[0]);
                            setData((prev) =>
                              prev.map((p) => p.id === policy.id ? { ...p, lapseStatus: "Current" } : p)
                            );
                          }}
                          className="flex-1 rounded-xl bg-dusk-ink/6 hover:bg-dusk-ink/10 py-2 font-sans text-xs font-semibold text-dusk-ink transition-colors"
                        >
                          Mark premium paid
                        </button>
                      )}
                      <Link
                        href={`/vault/${policy.id}`}
                        className="rounded-xl border border-dusk-ink/15 px-4 py-2 font-sans text-xs font-medium text-dusk-ink/60 hover:text-dusk-ink hover:border-dusk-ink/30 transition-colors"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
