"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { admin, type HouseholdSummaryDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const tierBadge: Record<string, string> = {
  Free: "bg-dusk-ink/8 text-dusk-ink/60",
  Individual: "bg-candlewick/10 text-candlewick",
  Family: "bg-sage/10 text-sage",
  BurialSociety: "bg-dusk-ink/8 text-dusk-ink",
};

export default function HouseholdsPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [items, setItems] = useState<HouseholdSummaryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async (search: string, pageNum: number) => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    try {
      const result = await admin.searchHouseholds(token, search || undefined, undefined, pageNum);
      setItems(result.items);
      setTotal(result.totalCount);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    load(debouncedQ, 1);
  }, [debouncedQ, load]);

  useEffect(() => {
    load(debouncedQ, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Households</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">Search by name or referral code</p>
      </div>

      <div className="relative">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-dusk-ink/30">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search households…"
          className="w-full max-w-md rounded-xl border border-dusk-ink/15 bg-white pl-10 pr-4 py-3 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
        />
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dusk-ink/8">
              {["Household", "Referral code", "Members", "Policies", "Plan", "Joined"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dusk-ink/5">
            {loading
              ? Array(5).fill(null).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(null).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-dusk-ink/6 animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              : items.map((hh) => (
                  <tr key={hh.householdId} className="hover:bg-dusk-ink/2 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-sans text-sm font-medium text-dusk-ink">
                      <Link href={`/households/${hh.householdId}`} className="hover:text-dusk-ink/70">
                        {hh.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink/60">{hh.referralCode}</td>
                    <td className="px-5 py-4 font-mono text-sm text-dusk-ink">{hh.memberCount}</td>
                    <td className="px-5 py-4 font-mono text-sm text-dusk-ink">{hh.policyCount}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${tierBadge[hh.subscriptionTier] ?? ""}`}>
                        {hh.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink/50">
                      {new Date(hh.createdAt).toLocaleDateString("en-ZA")}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!loading && items.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-sans text-sm text-dusk-ink/40">No households found.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-dusk-ink/6 flex items-center justify-between">
            <p className="font-sans text-xs text-dusk-ink/40">{total} total</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg border border-dusk-ink/15 font-sans text-xs text-dusk-ink disabled:opacity-30"
              >
                Prev
              </button>
              <span className="font-mono text-xs text-dusk-ink/50">{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-dusk-ink/15 font-sans text-xs text-dusk-ink disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
