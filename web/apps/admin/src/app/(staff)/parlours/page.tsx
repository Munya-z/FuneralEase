"use client";

import { useEffect, useState } from "react";
import { admin, type ParlourDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export default function ParloursPage() {
  const [pending, setPending] = useState<ParlourDto[]>([]);
  const [moderated, setModerated] = useState<{ parlour: ParlourDto; approved: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    admin.getPendingParlours(token).then(setPending).catch(() => null).finally(() => setLoading(false));
  }, []);

  async function moderate(parlour: ParlourDto, approve: boolean) {
    const token = getAdminToken();
    if (!token) return;
    setActioning(parlour.id);
    try {
      await admin.moderateParlour(token, parlour.id, approve);
      setPending((prev) => prev.filter((p) => p.id !== parlour.id));
      setModerated((prev) => [{ parlour, approved: approve }, ...prev]);
    } finally {
      setActioning(null);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Parlour moderation</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">Review and approve funeral home listings</p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-dusk-ink/20 border-t-dusk-ink" />
        </div>
      )}

      {!loading && pending.length === 0 && moderated.length === 0 && (
        <div className="rounded-2xl bg-sage/10 border border-sage/20 px-5 py-4">
          <p className="font-sans text-sm text-sage font-medium">Queue is clear — all listings reviewed.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-0.5 flex-1">
                  <p className="font-sans text-sm font-semibold text-dusk-ink">{p.name}</p>
                  <p className="font-sans text-xs text-dusk-ink/50">{p.area} · {p.province}</p>
                  <p className="font-sans text-xs text-dusk-ink/40 mt-1">
                    {p.contactName} · {p.emailAddress} · {p.phoneNumber}
                  </p>
                  {p.description && (
                    <p className="font-sans text-xs text-dusk-ink/50 mt-1 italic">{p.description}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-candlewick/10 px-2.5 py-0.5 font-sans text-xs font-medium text-candlewick">
                  Pending
                </span>
              </div>
              <div className="border-t border-dusk-ink/6 px-5 py-3 flex gap-2">
                <button
                  disabled={actioning === p.id}
                  onClick={() => moderate(p, true)}
                  className="rounded-xl bg-sage/10 px-4 py-2 font-sans text-xs font-semibold text-sage hover:bg-sage/20 transition-colors disabled:opacity-50"
                >
                  {actioning === p.id ? "Processing…" : "Approve"}
                </button>
                <button
                  disabled={actioning === p.id}
                  onClick={() => moderate(p, false)}
                  className="rounded-xl bg-ember/10 px-4 py-2 font-sans text-xs font-semibold text-ember hover:bg-ember/20 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {moderated.length > 0 && (
        <>
          <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">This session</p>
          <div className="space-y-2">
            {moderated.map(({ parlour, approved }) => (
              <div key={parlour.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-dusk-ink/70">{parlour.name}</p>
                  <p className="font-sans text-xs text-dusk-ink/40">{parlour.area}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${approved ? "bg-sage/10 text-sage" : "bg-ember/10 text-ember"}`}>
                  {approved ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
