"use client";

import { useEffect, useState } from "react";
import { admin, type LegalProfessionalDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const PRACTICE_TYPE_LABELS: Record<string, string> = {
  EstateAttorney: "Estate Attorney",
  Notary: "Notary",
  TaxPractitioner: "Tax Practitioner",
  ConveyancingAttorney: "Conveyancing Attorney",
  Accountant: "Accountant",
};

export default function LegalDirectoryPage() {
  const [pending, setPending] = useState<LegalProfessionalDto[]>([]);
  const [moderated, setModerated] = useState<{ item: LegalProfessionalDto; approved: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    admin.getPendingLegalProfessionals(token)
      .then(setPending)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function moderate(item: LegalProfessionalDto, approve: boolean, note?: string) {
    const token = getAdminToken();
    if (!token) return;
    setActioning(item.id);
    try {
      await admin.moderateLegalProfessional(token, item.id, approve, note);
      setPending((prev) => prev.filter((p) => p.id !== item.id));
      setModerated((prev) => [{ item, approved: approve }, ...prev]);
      setRejectingId(null);
      setRejectNote("");
    } finally {
      setActioning(null);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-dusk-ink">Legal directory</h1>
        <p className="font-sans text-sm text-dusk-ink/50 mt-1">Review and approve legal professional listings</p>
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
          {pending.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-sans text-sm font-semibold text-dusk-ink">{item.firmName}</p>
                      <span className="rounded-full bg-dusk-ink/10 px-2 py-0.5 font-mono text-xs text-dusk-ink/60">
                        {PRACTICE_TYPE_LABELS[item.practiceType] ?? item.practiceType}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-dusk-ink/50">{item.area} · {item.province}</p>
                    <p className="font-sans text-xs text-dusk-ink/40 mt-1">
                      {item.contactName} · {item.emailAddress} · {item.phoneNumber}
                    </p>
                    {item.website && (
                      <p className="font-mono text-xs text-dusk-ink/30 mt-0.5">{item.website}</p>
                    )}
                    {item.description && (
                      <p className="font-sans text-xs text-dusk-ink/50 mt-1 italic">{item.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-candlewick/10 px-2.5 py-0.5 font-sans text-xs font-medium text-candlewick">
                    Pending
                  </span>
                </div>

                {rejectingId === item.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Rejection reason (optional)"
                      rows={2}
                      className="w-full rounded-xl border border-dusk-ink/15 px-3 py-2 font-sans text-xs text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-1 focus:ring-dusk-ink/20"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => moderate(item, false, rejectNote)}
                        disabled={actioning === item.id}
                        className="rounded-xl bg-ember/10 px-4 py-2 font-sans text-xs font-semibold text-ember hover:bg-ember/20 transition-colors disabled:opacity-50"
                      >
                        {actioning === item.id ? "Processing…" : "Confirm reject"}
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectNote(""); }}
                        className="rounded-xl bg-dusk-ink/6 px-4 py-2 font-sans text-xs text-dusk-ink/50 hover:bg-dusk-ink/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {rejectingId !== item.id && (
                <div className="border-t border-dusk-ink/6 px-5 py-3 flex gap-2">
                  <button
                    disabled={actioning === item.id}
                    onClick={() => moderate(item, true)}
                    className="rounded-xl bg-sage/10 px-4 py-2 font-sans text-xs font-semibold text-sage hover:bg-sage/20 transition-colors disabled:opacity-50"
                  >
                    {actioning === item.id ? "Processing…" : "Approve"}
                  </button>
                  <button
                    disabled={actioning === item.id}
                    onClick={() => setRejectingId(item.id)}
                    className="rounded-xl bg-ember/10 px-4 py-2 font-sans text-xs font-semibold text-ember hover:bg-ember/20 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {moderated.length > 0 && (
        <>
          <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">This session</p>
          <div className="space-y-2">
            {moderated.map(({ item, approved }) => (
              <div key={item.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-dusk-ink/70">{item.firmName}</p>
                  <p className="font-sans text-xs text-dusk-ink/40">
                    {PRACTICE_TYPE_LABELS[item.practiceType] ?? item.practiceType} · {item.area}
                  </p>
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
