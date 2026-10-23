"use client";

import { useEffect, useState } from "react";
import { admin, type DashboardDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    admin.getDashboard(token).then(setData).catch(() => null).finally(() => setLoading(false));
  }, []);

  const mrr = data ? `R${data.estimatedMrr.toLocaleString()}` : "—";
  const metrics = data
    ? [
        { label: "Total households", value: data.totalHouseholds.toLocaleString(), sub: "All time" },
        { label: "Active subscriptions", value: data.activeSubscriptions.toLocaleString(), sub: "Across all tiers" },
        { label: "Estimated MRR", value: mrr, sub: "Individual + Family + Society" },
        { label: "Total policies", value: data.totalPolicies.toLocaleString(), sub: "All households" },
        { label: "Open claims", value: data.openClaims.toLocaleString(), sub: "In progress" },
        { label: "Lapsed policies", value: data.lapsedPolicies.toLocaleString(), sub: "30+ days overdue" },
        { label: "Parlour queue", value: data.pendingParlours.toLocaleString(), sub: "Pending moderation" },
        { label: "Referral coeff.", value: "—", sub: "Tracking from day 1" },
      ]
    : Array(8).fill({ label: "—", value: "—", sub: "—" });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Dashboard</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">
          {loading ? "Loading…" : "Live data"}
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
            <p className="font-sans text-xs text-dusk-ink/50">{m.label}</p>
            <p className="mt-1.5 font-mono text-2xl font-medium text-dusk-ink">
              {loading ? <span className="inline-block h-6 w-12 animate-pulse rounded bg-dusk-ink/8" /> : m.value}
            </p>
            <p className="mt-1 font-sans text-xs text-dusk-ink/40">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Tier breakdown */}
      {data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { tier: "Free", count: data.tierBreakdown.free, mrr: "R0", color: "text-dusk-ink/60" },
            { tier: "Individual (R9/mo)", count: data.tierBreakdown.individual, mrr: `R${(data.tierBreakdown.individual * 9).toLocaleString()}`, color: "text-candlewick" },
            { tier: "Family (R29/mo)", count: data.tierBreakdown.family, mrr: `R${(data.tierBreakdown.family * 29).toLocaleString()}`, color: "text-sage" },
            { tier: "Burial Society (R99+)", count: data.tierBreakdown.burialSociety, mrr: `R${(data.tierBreakdown.burialSociety * 99).toLocaleString()}`, color: "text-dusk-ink" },
          ].map((t) => (
            <div key={t.tier} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
              <p className="font-sans text-xs text-dusk-ink/50 mb-2">{t.tier}</p>
              <p className={`font-mono text-xl font-medium ${t.color}`}>{t.mrr}</p>
              <p className="font-sans text-xs text-dusk-ink/40 mt-0.5">{t.count} household{t.count !== 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
