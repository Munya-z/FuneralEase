"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { admin as adminApi, type AdminClaimSummaryDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const STATUS_OPTIONS = ["InProgress", "Submitted", "UnderReview", "Approved", "Rejected"] as const;

const statusStyle: Record<string, string> = {
  InProgress:   "bg-dusk-ink/8 text-dusk-ink/60",
  Submitted:    "bg-candlewick/10 text-candlewick",
  UnderReview:  "bg-dusk-ink/10 text-dusk-ink",
  Approved:     "bg-sage/10 text-sage",
  Rejected:     "bg-ember/10 text-ember",
};

export default function AdminClaimsPage() {
  const [items, setItems] = useState<AdminClaimSummaryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (status: string | undefined, p: number) => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    try {
      const result = await adminApi.getClaims(token, status, p);
      setItems(result.items);
      setTotal(result.totalCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(statusFilter, page);
  }, [statusFilter, page, load]);

  function selectStatus(s: string | undefined) {
    setStatusFilter(s);
    setPage(1);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Claims</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">All household funeral claims across the platform</p>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => selectStatus(undefined)}
          className={`rounded-full px-3 py-1 font-sans text-xs font-medium transition ${!statusFilter ? "bg-dusk-ink text-warm-paper" : "bg-dusk-ink/8 text-dusk-ink/60 hover:bg-dusk-ink/15"}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => selectStatus(statusFilter === s ? undefined : s)}
            className={`rounded-full px-3 py-1 font-sans text-xs font-medium transition ${statusFilter === s ? (statusStyle[s] ?? "") + " ring-1 ring-current/20" : "bg-dusk-ink/6 text-dusk-ink/50 hover:bg-dusk-ink/12"}`}
          >
            {s === "InProgress" ? "In progress" : s === "UnderReview" ? "Under review" : s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dusk-ink/8">
              {["Deceased", "Household", "Status", "Created", "Submitted"].map((h) => (
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
                    {Array(5).fill(null).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-dusk-ink/6 animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : items.map((c) => (
                  <tr key={c.claimId} className="hover:bg-dusk-ink/2 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/claims/${c.claimId}`} className="font-sans text-sm font-medium text-dusk-ink hover:text-dusk-ink/70">
                        {c.deceasedFullName}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/households/${c.householdId}`} className="font-sans text-sm text-dusk-ink/70 hover:text-dusk-ink">
                        {c.householdName}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${statusStyle[c.status] ?? "bg-dusk-ink/8 text-dusk-ink/60"}`}>
                        {c.status === "InProgress" ? "In progress" : c.status === "UnderReview" ? "Under review" : c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink/50">
                      {new Date(c.createdAt).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink/50">
                      {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString("en-ZA") : "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!loading && items.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-sans text-sm text-dusk-ink/40">No claims found.</p>
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
