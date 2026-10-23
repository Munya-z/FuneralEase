"use client";

import { useEffect, useState } from "react";
import { admin as adminApi, type AuditLogEntryDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const CATEGORIES = ["Emergency", "Moderation", "Billing", "Popia", "Society", "Auth"] as const;

const categoryStyles: Record<string, { dot: string; label: string; badge: string }> = {
  Emergency: { dot: "bg-ember", label: "Emergency", badge: "bg-ember/10 text-ember" },
  Moderation: { dot: "bg-candlewick", label: "Moderation", badge: "bg-candlewick/10 text-candlewick" },
  Billing: { dot: "bg-sage", label: "Billing", badge: "bg-sage/10 text-sage" },
  Popia: { dot: "bg-dusk-ink/40", label: "POPIA", badge: "bg-dusk-ink/8 text-dusk-ink/60" },
  Society: { dot: "bg-dusk-ink", label: "Society", badge: "bg-dusk-ink/10 text-dusk-ink" },
  Auth: { dot: "bg-candlewick/60", label: "Auth", badge: "bg-candlewick/8 text-candlewick/80" },
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    adminApi.getAuditLog(token, page, categoryFilter)
      .then((r) => { setEntries(r.items); setTotalCount(r.totalCount); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, categoryFilter]);

  function exportCsv() {
    const header = "OccurredAt,Actor,Action,Category,Subject,Detail\n";
    const rows = entries.map((e) =>
      [e.occurredAt, e.actor, e.action, e.category, `"${e.subject}"`, `"${e.detail ?? ""}"`].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pageSize = 50;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Audit log</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">
          Immutable record of staff actions, system events, and POPIA data requests
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => { setCategoryFilter(undefined); setPage(1); }}
          className={`rounded-full px-3 py-1 font-sans text-xs font-medium transition ${!categoryFilter ? "bg-dusk-ink text-warm-paper" : "bg-dusk-ink/8 text-dusk-ink/60 hover:bg-dusk-ink/15"}`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const s = categoryStyles[cat];
          return (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(categoryFilter === cat ? undefined : cat); setPage(1); }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium transition ${categoryFilter === cat ? s.badge + " ring-1 ring-current/30" : "bg-dusk-ink/6 text-dusk-ink/50 hover:bg-dusk-ink/12"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </button>
          );
        })}
        <span className="ml-auto font-sans text-xs text-dusk-ink/30">Read-only · POPIA §14 — 7 year retention</span>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-dusk-ink/8 flex items-center justify-between">
          <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider">
            {loading ? "Loading…" : `${totalCount.toLocaleString()} event${totalCount !== 1 ? "s" : ""}`}
          </p>
          <button onClick={exportCsv} className="font-sans text-xs text-dusk-ink/50 hover:text-dusk-ink">
            Export CSV
          </button>
        </div>

        {error && (
          <div className="px-5 py-4">
            <p className="font-sans text-sm text-ember">{error}</p>
          </div>
        )}

        {loading && (
          <div className="divide-y divide-dusk-ink/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-dusk-ink/10 flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 rounded bg-dusk-ink/8 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-dusk-ink/6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-sans text-sm text-dusk-ink/40">No audit events found.</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="divide-y divide-dusk-ink/5">
            {entries.map((e) => {
              const cat = categoryStyles[e.category] ?? categoryStyles.Billing;
              return (
                <div key={e.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="mt-1.5 flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full block ${cat.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-medium text-dusk-ink">{e.action}</span>
                      <span className={`rounded-full px-2 py-0.5 font-sans text-xs font-medium ${cat.badge}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-dusk-ink/60">{e.subject}</p>
                    {e.detail && <p className="font-sans text-xs text-dusk-ink/40">{e.detail}</p>}
                    <div className="flex items-center gap-3 pt-0.5">
                      <span className="font-mono text-xs text-dusk-ink/30">
                        {new Date(e.occurredAt).toLocaleString("en-ZA")}
                      </span>
                      <span className="font-sans text-xs text-dusk-ink/30">·</span>
                      <span className="font-mono text-xs text-dusk-ink/40">{e.actor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
