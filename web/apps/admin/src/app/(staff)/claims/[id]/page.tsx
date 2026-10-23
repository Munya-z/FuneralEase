"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { admin as adminApi, type AdminClaimDetailDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const statusStyle: Record<string, string> = {
  InProgress:  "bg-dusk-ink/8 text-dusk-ink/60",
  Submitted:   "bg-candlewick/10 text-candlewick",
  UnderReview: "bg-dusk-ink/10 text-dusk-ink",
  Approved:    "bg-sage/10 text-sage",
  Rejected:    "bg-ember/10 text-ember",
};

const TRANSITIONS: Record<string, string[]> = {
  Submitted:   ["UnderReview"],
  UnderReview: ["Approved", "Rejected"],
};

const statusLabel = (s: string) =>
  s === "InProgress" ? "In progress" : s === "UnderReview" ? "Under review" : s;

export default function AdminClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<AdminClaimDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    try {
      const data = await adminApi.getClaimDetail(token, id);
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load claim");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(newStatus: string) {
    const token = getAdminToken();
    if (!token || !detail) return;
    setUpdating(newStatus);
    try {
      await adminApi.updateClaimStatus(token, detail.claimId, newStatus);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 rounded bg-dusk-ink/8 animate-pulse" />
        <div className="h-40 rounded-2xl bg-dusk-ink/6 animate-pulse" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8">
        <p className="font-sans text-sm text-ember">{error || "Claim not found."}</p>
        <Link href="/claims" className="mt-3 inline-block font-sans text-xs text-dusk-ink/50 hover:text-dusk-ink">
          ← Back to claims
        </Link>
      </div>
    );
  }

  const availableTransitions = TRANSITIONS[detail.status] ?? [];
  const requiredItems = detail.checklistItems.filter((i) => i.itemType === "Required");
  const optionalItems = detail.checklistItems.filter((i) => i.itemType === "Optional");
  const checkedRequired = requiredItems.filter((i) => i.isChecked).length;

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link href="/claims" className="font-sans text-xs text-dusk-ink/40 hover:text-dusk-ink mb-2 inline-block">
          ← Claims
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-dusk-ink">{detail.deceasedFullName}</h1>
            <p className="font-mono text-xs text-dusk-ink/40 mt-0.5">
              {detail.insurerName} · {detail.policyNumber}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 font-sans text-xs font-medium ${statusStyle[detail.status] ?? ""}`}>
            {statusLabel(detail.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Claim info */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 space-y-3">
          <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">Claim details</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-sans text-dusk-ink/50">Household</span>
              <Link href={`/households/${detail.householdId}`} className="font-sans font-medium text-dusk-ink hover:text-dusk-ink/70">
                {detail.householdName}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-dusk-ink/50">Created</span>
              <span className="font-mono text-dusk-ink/70">{new Date(detail.createdAt).toLocaleDateString("en-ZA")}</span>
            </div>
            {detail.submittedAt && (
              <div className="flex justify-between">
                <span className="font-sans text-dusk-ink/50">Submitted</span>
                <span className="font-mono text-dusk-ink/70">{new Date(detail.submittedAt).toLocaleDateString("en-ZA")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-sans text-dusk-ink/50">Checklist</span>
              <span className="font-mono text-dusk-ink/70">{checkedRequired}/{requiredItems.length} required</span>
            </div>
          </div>
        </div>

        {/* Status actions */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 space-y-3">
          <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">Status actions</p>
          {availableTransitions.length === 0 ? (
            <p className="font-sans text-sm text-dusk-ink/40">
              {detail.status === "Approved" || detail.status === "Rejected"
                ? "This claim has been finalised."
                : "No actions available in the current status."}
            </p>
          ) : (
            <div className="space-y-2">
              {availableTransitions.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating !== null}
                  className={`w-full rounded-xl px-4 py-2.5 font-sans text-sm font-semibold transition disabled:opacity-50 ${
                    s === "Approved"
                      ? "bg-sage text-white hover:bg-sage/90"
                      : s === "Rejected"
                        ? "bg-ember text-white hover:bg-ember/90"
                        : "bg-dusk-ink text-warm-paper hover:bg-dusk-ink/90"
                  }`}
                >
                  {updating === s ? "Updating…" : `Move to ${statusLabel(s)}`}
                </button>
              ))}
            </div>
          )}
          {error && <p className="font-sans text-xs text-ember">{error}</p>}
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-dusk-ink/8">
          <p className="font-sans text-xs font-semibold text-dusk-ink uppercase tracking-wider">
            Checklist ({detail.checklistItems.filter((i) => i.isChecked).length}/{detail.checklistItems.length} completed)
          </p>
        </div>
        <div className="divide-y divide-dusk-ink/5">
          {[...requiredItems, ...optionalItems].map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center gap-3">
              <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${
                item.isChecked ? "bg-sage" : "border border-dusk-ink/20"
              }`}>
                {item.isChecked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className={`font-sans text-sm flex-1 ${item.isChecked ? "text-dusk-ink/50 line-through" : "text-dusk-ink"}`}>
                {item.description}
              </p>
              <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${
                item.itemType === "Required" ? "bg-ember/8 text-ember/70" : "bg-dusk-ink/6 text-dusk-ink/40"
              }`}>
                {item.itemType}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
