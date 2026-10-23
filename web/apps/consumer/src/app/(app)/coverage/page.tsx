"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { coverageAnalysis as coverageApi, type CoverageAnalysisDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Text, Button } from "@/partials";

const STATUS_COLORS: Record<string, { bar: string; badge: string }> = {
  Current: { bar: "bg-sage", badge: "text-sage bg-sage/10 border-sage/20" },
  DueSoon: { bar: "bg-candlewick", badge: "text-candlewick bg-candlewick/10 border-candlewick/20" },
  Overdue: { bar: "bg-ember", badge: "text-ember bg-ember/10 border-ember/20" },
  Lapsed: { bar: "bg-ember/50", badge: "text-ember/70 bg-ember/6 border-ember/15" },
};

export default function CoveragePage() {
  const [data, setData] = useState<CoverageAnalysisDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    coverageApi.get(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalCover = data?.totalEstimatedCover ?? 0;
  const avgCost = data?.averageFuneralCost ?? 40000;
  const coverPct = Math.min(100, Math.round((totalCover / avgCost) * 100));

  return (
    <div className="w-full">
      <AppHeader title="Coverage Analysis" />

      <div className="px-6 py-6 space-y-5">
        <div className="rounded_bdr bg-dusk-ink px-4 py-4 space-y-1">
          <Text variant="heading_small" color="light" >Coverage Analysis</Text>
          <Text variant="heading_small" color="light" faded>See your total funeral cover, monthly premiums, and any gaps across all policies.</Text>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded_bdr bg-dusk-ink/6 animate-pulse" />)}
          </div>
        )}

        {error && (
          <div className="rounded_bdr bg-ember/10 border border-ember/20 px-4 py-4">
            <Text className="text-ember">{error}</Text>
          </div>
        )}

        {!loading && !error && !data && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/30">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <Text variant="heading_small" className=" mb-2">No coverage data yet</Text>
            <Text faded className=" mx-w-xs mb-6">
              Add your funeral policies to see how your coverage compares to the average funeral cost.
            </Text>

            <Link href="/vault/add">
              <Button>
                Add a policy
              </Button>
            </Link>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Top row: hero + gap side by side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Hero summary card */}
              <div className="lg:col-span-2 rounded-2xl bg-dusk-ink px-5 py-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-4">
                    <Text color="light" variant="body_small_sec" superFaded className=" text-[10px] tracking-widest mb-1">Policies</Text>
                    <Text color="light" variant="heading_sec" className="text-3xl ">{data.totalPolicies}</Text>
                    <Text color="light" variant="body_small" superFaded className="ont-sans text-xs text-warm-paper/40 mt-1">{data.activePoliciesCount} active</Text>
                  </div>
                  <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-4">
                    <Text color="light" variant="body_small_sec" superFaded className="text-[10px] uppercase mb-1">Monthly</Text>
                    <Text color="light" variant="heading_sec" superFaded className="text-3xl ">
                      R{data.totalMonthlyPremium.toLocaleString()}
                    </Text>
                    <Text variant="body_small" color="light" className=" mt-1">total premium</Text>
                  </div>
                  <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-4">
                    <Text color="light" variant="body_small_sec" superFaded className=" text-[10px] uppercase tracking-widest mb-1">Est. cover</Text>
                    <Text color="light" variant="heading_sec" superFaded className="text-3xl font-semibold ">
                      R{totalCover >= 1000 ? `${(totalCover / 1000).toFixed(0)}k` : totalCover.toLocaleString()}
                    </Text>
                    <Text color="light" variant="body_small" superFaded className="mt-1">{coverPct}% of avg cost</Text>
                  </div>
                </div>

                {/* Coverage progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Text as="span" color="light" superFaded variant="body_small" className="font-sans text-xs text-warm-paper/50">Coverage vs average funeral cost</Text>
                    <Text as="span" color="light" superFaded variant="body_small_sec" className="font-mono text-xs text-warm-paper/50">R{avgCost.toLocaleString()} avg</Text>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${data.hasCoverageGap ? "bg-candlewick" : "bg-sage"}`}
                      style={{ width: `${coverPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Gap / status card */}
              <div className={`rounded-2xl px-5 py-5 flex flex-col justify-between ${data.hasCoverageGap
                ? "bg-ember/8 border border-ember/20"
                : "bg-sage/8 border border-sage/20"
                }`}>
                <div>
                  <Text variant="body_small" className={` uppercase tracking-wider mb-2 ${data.hasCoverageGap ? "text-ember" : "text-sage"}`}>
                    {data.hasCoverageGap ? "Coverage gap" : "Fully covered"}
                  </Text>
                  {data.hasCoverageGap ? (
                    <>
                      <Text variant="heading_sec" className="text-3xl">
                        R{data.estimatedGap.toLocaleString()}
                      </Text>
                      <Text variant="body_small" superFaded className="mt-2 leading-relaxed">
                        Average SA funeral costs R{avgCost.toLocaleString()}. You may need more cover.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text variant="heading_sec" className="text-3xl text-sage">
                        R{(totalCover - avgCost).toLocaleString()}
                      </Text>
                      <Text variant="body_small" superFaded className="mt-2 leading-relaxed">
                        above average. Your cover exceeds the average SA funeral cost.
                      </Text>
                    </>
                  )}
                </div>
                {data.hasCoverageGap && (
                  <Link
                    href="/vault/add"
                    className="mt-4 block "
                  >
                    <Button>

                      Add a policy
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom row: bar chart + status breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Coverage bar */}
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 space-y-4">
                <Text variant="body_small" superFaded className="uppercase tracking-wider">
                  Coverage vs average funeral cost
                </Text>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Text as="span" superFaded variant="body_small" className="font-sans text-xs text-dusk-ink/60">Your estimated cover</Text>
                      <Text as="span" variant="body_small_sec" className="font-mono text-xs font-medium text-dusk-ink">R{totalCover.toLocaleString()}</Text>
                    </div>
                    <div className="h-3 rounded-full bg-dusk-ink/6 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${data.hasCoverageGap ? "bg-candlewick" : "bg-sage"}`}
                        style={{ width: `${coverPct}%` }}
                      />
                    </div>
                    <Text variant="body_small" superFaded >{coverPct}% of average funeral cost</Text>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Text as="span" superFaded variant="body_small" className="font-sans text-xs text-dusk-ink/60">Average SA funeral</Text>
                      <Text as="span" variant="body_small_sec" className="font-mono text-xs font-medium text-dusk-ink">R{avgCost.toLocaleString()}</Text>
                    </div>
                    <div className="h-3 rounded-full bg-dusk-ink/6 overflow-hidden">
                      <div className="h-full w-full rounded-full bg-dusk-ink/20" />
                    </div>
                  </div>
                </div>
                <Text variant="body_small" superFaded  >
                  * Estimated cover uses your policy&#39;s declared benefit amount, or premium × 120 as a fallback.
                </Text>
              </div>

              {/* Policy status breakdown */}
              {Object.keys(data.policyStatusBreakdown).length > 0 && (
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 space-y-4">
                  <Text superFaded variant="body_small" className="uppercase tracking-wider">
                    Policy status breakdown
                  </Text>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(data.policyStatusBreakdown).map(([status, count]) => {
                      const colors = STATUS_COLORS[status] ?? { badge: "text-dusk-ink/60 bg-dusk-ink/6 border-dusk-ink/10", bar: "bg-dusk-ink/20" };
                      return (
                        <div key={status} className={`rounded-xl border px-4 py-4 ${colors.badge}`}>
                          <Text superFaded variant="heading_sec" className="text-3xl">{count}</Text>
                          <Text faded variant="body_small" className="mt-1">{status}</Text>
                        </div>
                      );
                    })}
                  </div>
                  <Text variant="body_small" superFaded >
                    {data.activePoliciesCount} active · {data.lapsedPoliciesCount} lapsed
                  </Text>
                </div>
              )}
            </div>{/* end bottom grid */}

            {/* CTA if gap */}
            {data.hasCoverageGap && (
              <div className="rounded-2xl bg-ember/6 border border-ember/15 px-5 py-4 space-y-3">
                <Text >Close the gap</Text>
                <Text faded variant="body_small" className="leading-relaxed">
                  You have a coverage gap of R{data.estimatedGap.toLocaleString()}.
                  Consider adding another policy or upgrading your existing cover.
                </Text>
                <div className="flex gap-2">
                  <Link
                    href="/vault/add"

                  >
                    <Button>
                      Add a policy
                    </Button>
                  </Link>
                  <Link
                    href="/upgrade"

                  >
                    <Button variant="outline_dark">

                      Upgrade plan
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
