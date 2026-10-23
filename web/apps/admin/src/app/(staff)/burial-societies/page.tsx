"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { admin as adminApi, type BurialSocietySummaryDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export default function BurialSocietiesPage() {
  const [items, setItems] = useState<BurialSocietySummaryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    adminApi.getBurialSocieties(token, page)
      .then((r) => { setItems(r.items); setTotalCount(r.totalCount); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Burial societies</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">
          All registered burial societies and their member counts
        </p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-dusk-ink/8">
          <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider">
            {loading ? "Loading…" : `${totalCount.toLocaleString()} societ${totalCount !== 1 ? "ies" : "y"}`}
          </p>
        </div>

        {error && (
          <div className="px-5 py-4">
            <p className="font-sans text-sm text-ember">{error}</p>
          </div>
        )}

        {loading && (
          <div className="divide-y divide-dusk-ink/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 rounded bg-dusk-ink/8 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-dusk-ink/6 animate-pulse" />
                </div>
                <div className="h-6 w-12 rounded-full bg-dusk-ink/8 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-sans text-sm text-dusk-ink/40">No burial societies found.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="divide-y divide-dusk-ink/5">
            {items.map((s) => (
              <div key={s.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/burial-societies/${s.id}`} className="font-sans text-sm font-medium text-dusk-ink hover:text-dusk-ink/70 underline underline-offset-2">{s.name}</Link>
                    {s.registrationNumber && (
                      <span className="rounded-full px-2 py-0.5 font-mono text-xs bg-dusk-ink/8 text-dusk-ink/60">
                        {s.registrationNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-xs text-dusk-ink/40">
                      R{s.monthlyContributionAmount.toFixed(2)}/mo
                    </span>
                    <span className="font-sans text-xs text-dusk-ink/30">·</span>
                    <span className="font-mono text-xs text-dusk-ink/40">
                      Admin: {s.adminHouseholdId.slice(0, 8)}…
                    </span>
                    <span className="font-sans text-xs text-dusk-ink/30">·</span>
                    <span className="font-mono text-xs text-dusk-ink/30">
                      {new Date(s.createdAt).toLocaleDateString("en-ZA")}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="rounded-full px-2.5 py-0.5 font-sans text-xs font-medium bg-dusk-ink/8 text-dusk-ink">
                    {s.memberCount} member{s.memberCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-dusk-ink/6 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="font-sans text-xs text-dusk-ink/50 hover:text-dusk-ink disabled:opacity-30"
            >
              ← Previous
            </button>
            <p className="font-sans text-xs text-dusk-ink/30">Page {page} of {totalPages}</p>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="font-sans text-xs text-dusk-ink/50 hover:text-dusk-ink disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
