"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Text, Button, Box, Icon } from '@/partials';
import { policies as policiesApi, claims as claimsApi, type PolicyDto, type ClaimDto } from "@/lib/api";
import { getToken } from "@/lib/auth";

const LAPSE_PRIORITY: Record<PolicyDto["lapseStatus"], number> = {
  Lapsed: 0,
  Overdue: 1,
  DueSoon: 2,
  Current: 3,
};

const lapseStyle: Record<PolicyDto["lapseStatus"], { label: string; dot: string; text: string; bg: string; bar: string }> = {
  Lapsed: { label: "Lapsed", dot: "bg-ember", text: "text-ember", bg: "bg-ember/8 border-ember/20", bar: "bg-ember" },
  Overdue: { label: "Overdue", dot: "bg-ember", text: "text-ember", bg: "bg-ember/8 border-ember/20", bar: "bg-ember" },
  DueSoon: { label: "Due soon", dot: "bg-candlewick", text: "text-candlewick", bg: "bg-candlewick/8 border-candlewick/20", bar: "bg-candlewick" },
  Current: { label: "Paid", dot: "bg-sage", text: "text-sage", bg: "bg-sage/8 border-sage/20", bar: "bg-sage" },
};

const claimStatusLabel: Record<string, string> = {
  InProgress: "In progress",
  Submitted: "Submitted",
  UnderReview: "Under review",
  Approved: "Approved",
  Rejected: "Rejected",
};

const claimStatusStyle: Record<string, string> = {
  InProgress: "bg-dusk-ink/8 text-dusk-ink/60",
  Submitted: "bg-candlewick/10 text-candlewick",
  UnderReview: "bg-candlewick/10 text-candlewick",
  Approved: "bg-sage/10 text-sage",
  Rejected: "bg-ember/10 text-ember",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatusBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-dusk-ink/8 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function HomePage() {
  const [policies, setPolicies] = useState<PolicyDto[]>([]);
  const [claims, setClaims] = useState<ClaimDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [today, setToday] = useState("");
  const [greetingText, setGreetingText] = useState("Hello");

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const name = (payload["name"] as string) || null;
        if (name) setFirstName(name.split(" ")[0]);
      } catch { /* ignore */ }
    }
    setToday(new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    setGreetingText(greeting());
  }, []);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const [p, c] = await Promise.all([
        policiesApi.list(token),
        claimsApi.list(token),
      ]);
      setPolicies(p);
      setClaims(c);
    } catch (err) {
      // On 401, the layout's isAuthenticated() check (which validates expiry)
      // will redirect to onboarding on next render — nothing extra needed here
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const attentionPolicies = policies
    .filter((p) => p.lapseStatus !== "Current")
    .sort((a, b) => LAPSE_PRIORITY[a.lapseStatus] - LAPSE_PRIORITY[b.lapseStatus]);

  const activeClaims = claims.filter((c) => c.status !== "Approved" && c.status !== "Rejected");
  const resolvedClaims = claims.filter((c) => c.status === "Approved" || c.status === "Rejected");

  const totalPremium = policies.reduce((s, p) => s + p.premiumAmount, 0);
  const allPaid = attentionPolicies.length === 0;

  // Policy status distribution
  const statusCounts = {
    Current: policies.filter((p) => p.lapseStatus === "Current").length,
    DueSoon: policies.filter((p) => p.lapseStatus === "DueSoon").length,
    Overdue: policies.filter((p) => p.lapseStatus === "Overdue").length,
    Lapsed: policies.filter((p) => p.lapseStatus === "Lapsed").length,
  };


  async function markPaid(policyId: string) {
    const token = getToken();
    if (!token) return;
    setMarkingPaid(policyId);
    try {
      await policiesApi.markPaid(token, policyId, new Date().toISOString().split("T")[0]);
      setPolicies((prev) =>
        prev.map((p) => p.id === policyId ? { ...p, lapseStatus: "Current" } : p)
      );
    } finally {
      setMarkingPaid(null);
    }
  }

  return (
    <div className="w-full min-h-screen bg-warm-paper/60">
      {/* Page header */}
      <div className="bg-white border-b border-dusk-ink/8 px-6 py-5">
        <div className="flex items-center justify-between gap-4 animate-fade-up">
          <div>
            <Text variant="heading_sec" faded color="candle" className="mb-0.5" >{today}</Text>
            <Text variant="heading_small">
              {greetingText}{firstName ? `, ${firstName}` : ""}
            </Text>
          </div>
          {allPaid && policies.length > 0 && (
            <div className="flex items-center gap-2 rounded-bdr bg-sage/10 border border-sage/20 px-4 py-2">
              <Icon variant="sage" size="small" >
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Icon>
              <Text as="span" className="text-sage">All policies up to date</Text>
            </div>
          )}
          {attentionPolicies.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-ember/10 border border-ember/20 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
              <Text as="span" className="text-ember">{attentionPolicies.length} polic{attentionPolicies.length === 1 ? "y" : "ies"} need attention</Text>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* KPI stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-dusk-ink/8 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-delay">
            <Box variant="dark">
              <Text variant="heading_sec" color='light' faded className="mb-3">Total Policies</Text>
              <Text variant="heading_sec_lg" color="light" >{policies.length}</Text>
              <Text variant="body_small" color='candle' superFaded className="mt-1">active policies</Text>
            </Box>
            <Box variant="light">
              <Text variant="heading_sec" faded className="mb-3">Monthly Premium</Text>
              <Text variant="heading_sec_lg">R{totalPremium.toLocaleString()}</Text>
              <Text variant="body_small" className="mt-1" superFaded>per month total</Text>
            </Box>
            <Box variant="light">
              <Text variant="heading_sec" faded className="mb-3">Active Claims</Text>
              <Text variant="heading_sec_lg" className={`${activeClaims.length > 0 ? "text-candlewick" : "text-dusk-ink"}`}>
                {activeClaims.length}
              </Text>
              <Text variant="body_small" superFaded className="mt-1">{resolvedClaims.length} resolved</Text>
            </Box>
            <Box variant="light">
              <Text variant="heading_sec" faded className="mb-3">Needs Attention</Text>
              <Text variant="heading_sec_lg" className={`${attentionPolicies.length > 0 ? "text-ember" : "text-sage"}`}>
                {attentionPolicies.length}
              </Text>
              <Text variant="body_small" superFaded className="mt-1">
                {attentionPolicies.length === 0 ? "all policies paid" : "overdue or lapsing"}
              </Text>
            </Box>
          </div>
        )}

        {!loading && policies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Policy health breakdown */}
            <div className="lg:col-span-1 rounded-2xl bg-white border border-dusk-ink/8 p-5">
              <Text as="h2" className="mb-4">Policy Health</Text>
              <div className="space-y-3">
                {(["Current", "DueSoon", "Overdue", "Lapsed"] as const).map((status) => {
                  const s = lapseStyle[status];
                  const count = statusCounts[status];
                  const pct = policies.length > 0 ? (count / policies.length) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                          <Text as="span" variant="body_small" faded>{s.label}</Text>
                        </div>
                        <Text as="span" variant="body_small_sec">{count}</Text>
                      </div>
                      <StatusBar pct={pct} color={s.bar} />
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-dusk-ink/8">
                <div className="flex items-center justify-between">
                  <Text as="span" variant="body_small" superFaded>Coverage health</Text>
                  <Text as="span" variant="body_sec" >
                    {policies.length > 0 ? Math.round((statusCounts.Current / policies.length) * 100) : 0}%
                  </Text>
                </div>
                <StatusBar pct={policies.length > 0 ? (statusCounts.Current / policies.length) * 100 : 0} color="bg-sage" />
              </div>
            </div>

            {/* Premium breakdown by insurer */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-dusk-ink/8 p-5">
              <div className="flex items-center justify-between mb-4">
                <Text as="h2" >Premium Breakdown</Text>
                <Link href="/vault" className="font-sans text-xs text-dusk-ink/40 hover:text-dusk-ink transition-colors">
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {policies.slice(0, 6).map((p) => {
                  const s = lapseStyle[p.lapseStatus];
                  const pct = totalPremium > 0 ? (p.premiumAmount / totalPremium) * 100 : 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                            <Text as="span" variant="body_small" >{p.insurerName}</Text>
                          </div>
                          <Text as="span" variant="body_small_sec" className="ml-3 flex-shrink-0">
                            R{p.premiumAmount.toLocaleString()}
                          </Text>
                        </div>
                        <StatusBar pct={pct} color={s.bar} />
                      </div>
                    </div>
                  );
                })}
                {policies.length > 6 && (
                  <Text variant="body_small" superFaded className="pt-1">+{policies.length - 6} more policies</Text>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-dusk-ink/8 flex items-center justify-between">
                <Text as="span" variant="body_small">Total monthly</Text>
                <Text as="span" variant="heading_sec" >R{totalPremium.toLocaleString()}/mo</Text>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Attention needed */}
            {attentionPolicies.length > 0 && (
              <div className="rounded-2xl bg-white border border-dusk-ink/8 p-5">
                <div className="flex items-center justify-between mb-4">
                  <Text as="h2" className="font-sans text-sm font-semibold text-dusk-ink">Needs Attention</Text>
                  <span className="rounded-full bg-ember/10 border border-ember/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-ember">
                    {attentionPolicies.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {attentionPolicies.map((p) => {
                    const s = lapseStyle[p.lapseStatus];
                    return (
                      <div key={p.id} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                              <Text variant="body_small" className={`${s.text}`}>{s.label}</Text>
                            </div>
                            <Text>{p.insurerName}</Text>
                            <Text variant="body_small">Due {p.nextDueDate} · R{p.premiumAmount.toLocaleString()}/mo</Text>
                          </div>
                          <button
                            onClick={() => markPaid(p.id)}
                            disabled={markingPaid === p.id}
                            className="flex-shrink-0 rounded-lg bg-dusk-ink px-3 py-1.5 font-sans text-xs font-semibold text-warm-paper disabled:opacity-50 hover:bg-dusk-ink/80 transition-colors"
                          >
                            {markingPaid === p.id ? "…" : "Mark paid"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active claims */}
            {activeClaims.length > 0 && (
              <div className="rounded-2xl bg-white border border-dusk-ink/8 p-5">
                <div className="flex items-center justify-between mb-4">
                  <Text as="h2" >Active Claims</Text>
                  <Link href="/claims" className="font-sans text-xs text-dusk-ink/40 hover:text-dusk-ink transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {activeClaims.map((c) => (
                    <Link
                      key={c.id}
                      href={`/claims/${c.id}`}
                      className="flex items-center justify-between rounded-xl bg-warm-paper border border-dusk-ink/8 px-4 py-3 hover:bg-dusk-ink/4 transition-colors"
                    >
                      <div className="min-w-0">
                        <Text >{c.deceasedFullName}</Text>
                        <Text variant="body_small" superFaded className="mt-0.5">
                          {new Date(c.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${claimStatusStyle[c.status] ?? ""}`}>
                          {claimStatusLabel[c.status] ?? c.status}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/25">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        {!loading && (
          <div>
            <Text variant="heading_small" className="uppercase mb-3">Quick Actions</Text>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: "Add Policy",
                  desc: "Track a new funeral cover",
                  href: "/vault/add",
                  icon: (
                    <Icon>
                      <rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
                      <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </Icon>
                  ),
                },
                {
                  label: "Start a Claim",
                  desc: "Submit a new claim",
                  href: "/claims",
                  icon: (
                    <Icon>
                      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.75" />
                      <path d="M8.5 10L11 12.5L15.5 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="8" y1="16.5" x2="16" y2="16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </Icon>
                  ),
                },
                {
                  label: "Emergency Access",
                  desc: "Share with family",
                  href: "/family",
                  icon: (
                    <Icon>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </Icon>
                  ),
                },
                {
                  label: "Find Parlour",
                  desc: "Locate funeral services",
                  href: "/parlours",
                  icon: (
                    <Icon>
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" stroke="currentColor" strokeWidth="1.75" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
                    </Icon>
                  ),
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col gap-3 transition-all"
                >
                  <Box>

                    <span>{action.icon}</span>
                    <div>
                      <Text variant="body">{action.label}</Text>
                      <Text variant="body_small" superFaded className="mt-0.5">{action.desc}</Text>
                    </div>
                  </Box>
                </Link>
              ))}
            </div>
          </div>

        )}

        {/* Empty state */}
        {!loading && policies.length === 0 && (
          <Box className="relative  flex flex-col items-center text-center animate-fade-up-delay">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,165,79,0.12),_transparent_55%)]" aria-hidden />
            <div className="relative w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-5">
              <Icon >
                <rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7V5.5C7 4.119 8.119 3 9.5 3H14.5C15.881 3 17 4.119 17 5.5V7" stroke="currentColor" strokeWidth="1.5" />
              </Icon>
            </div>
            <Text variant="heading_small" className="relative mb-2">Welcome to FuneralEase</Text>
            <Text variant="body" faded className="max-w-sm mb-6">
              Add your first funeral policy to start tracking premiums, receive lapse warnings, and manage claims.
            </Text>
            <Button>
              <Link
                href="/vault/add"
                className="relative "
              >
                Add your first policy
              </Link>
            </Button>
          </Box>
        )}

      </div>
    </div >
  );
}
