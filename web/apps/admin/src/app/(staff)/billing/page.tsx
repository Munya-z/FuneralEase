"use client";

import { useEffect, useState } from "react";
import { admin, type BillingEventDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const channelBadge: Record<string, string> = {
  AppStore: "bg-blue-50 text-blue-600",
  PlayStore: "bg-green-50 text-green-600",
  Paystack: "bg-indigo-50 text-indigo-600",
};

export default function BillingPage() {
  const [events, setEvents] = useState<BillingEventDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    admin.getBillingEvents(token, page)
      .then((r) => { setEvents(r.items); setTotal(r.totalCount); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [page]);

  function exportCsv() {
    const rows = [
      ["ID", "Channel", "Provider Event ID", "Event Type", "Household ID", "Processed At"],
      ...events.map((e) => [e.id, e.channel, e.providerEventId, e.eventType, e.householdId, e.processedAt]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-events-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Billing events</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">
          Deduplication log — {total} events processed
        </p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-dusk-ink/8 flex items-center justify-between">
          <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider">Events</p>
          <button onClick={exportCsv} className="font-sans text-xs text-dusk-ink/50 hover:text-dusk-ink">
            Export CSV
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-dusk-ink/6">
              {["Channel", "Provider Event ID", "Event Type", "Household", "Processed"].map((h) => (
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
              : events.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2 py-0.5 font-sans text-xs font-medium ${channelBadge[e.channel] ?? "bg-dusk-ink/8 text-dusk-ink/60"}`}>
                        {e.channel}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink/60 max-w-48 truncate" title={e.providerEventId}>
                      {e.providerEventId}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink/60">{e.eventType}</td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink">{e.householdId.slice(0, 8)}…</td>
                    <td className="px-5 py-4 font-mono text-xs text-dusk-ink/40">
                      {new Date(e.processedAt).toLocaleString("en-ZA")}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!loading && events.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-sans text-sm text-dusk-ink/40">No billing events recorded yet.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-dusk-ink/6 flex items-center justify-between">
            <p className="font-sans text-xs text-dusk-ink/40">{total} total</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg border border-dusk-ink/15 font-sans text-xs text-dusk-ink disabled:opacity-30">
                Prev
              </button>
              <span className="font-mono text-xs text-dusk-ink/50">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-dusk-ink/15 font-sans text-xs text-dusk-ink disabled:opacity-30">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
