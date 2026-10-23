"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { policies as policiesApi, claims as claimsApi, type PolicyDto, type ClaimDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Input, Text, Button } from "@/partials";

const claimStatusStyle: Record<string, string> = {
  InProgress: "bg-candlewick/10 text-candlewick border-candlewick/20",
  Submitted: "bg-dusk-ink/8 text-dusk-ink/60 border-dusk-ink/15",
  UnderReview: "bg-candlewick/10 text-candlewick border-candlewick/20",
  Approved: "bg-sage/10 text-sage border-sage/20",
  Rejected: "bg-ember/10 text-ember border-ember/20",
};

const claimStatusLabel: Record<string, string> = {
  InProgress: "In progress",
  Submitted: "Submitted",
  UnderReview: "Under review",
  Approved: "Approved",
  Rejected: "Rejected",
};

export default function ClaimsPage() {
  const [policyList, setPolicyList] = useState<PolicyDto[]>([]);
  const [claimsList, setClaimsList] = useState<ClaimDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [deceasedName, setDeceasedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      policiesApi.list(token).then(setPolicyList),
      claimsApi.list(token).then(setClaimsList),
    ]).finally(() => setLoading(false));
  }, []);

  async function startClaim(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const claim = await claimsApi.create(token, selectedPolicy, deceasedName);
      setClaimsList((prev) => [claim, ...prev]);
      setShowForm(false);
      setSelectedPolicy("");
      setDeceasedName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start claim");
    } finally {
      setSubmitting(false);
    }
  }

  const activeClaims = claimsList.filter((c) => c.status !== "Approved" && c.status !== "Rejected");
  const resolvedClaims = claimsList.filter((c) => c.status === "Approved" || c.status === "Rejected");

  return (
    <div className="w-full">
      <AppHeader
        title="Claims"
        action={
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 "
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Start a claim
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-6">
        <div className="rounded_bdr bg-dusk-ink px-4 py-4 space-y-1">
          <Text variant="heading_small" color="light">Claims</Text>
          <Text variant="body_small" color="light" faded>Track your insurance claims and manage required documents through every step.</Text>
        </div>

        {/* New claim modal/panel */}
        {showForm && (
          <div className="rounded-2xl bg-white border border-dusk-ink/8 p-6">
            <div className="flex items-center justify-between mb-5">
              <Text as="h2" >Start New Claim</Text>
              <Button variant="sec" type="button" onClick={() => setShowForm(false)} >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Button>
            </div>
            <form onSubmit={startClaim} className="space-y-4 max-w-lg">
              <div>
                <label className="block font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider mb-1.5">Which policy?</label>
                <select
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  required
                  className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-4 py-3 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                >
                  <option value="">Select a policy…</option>
                  {policyList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.insurerName} — {p.policyNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>

                <Input
                  label="Name of the deceased"
                  type="text"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  placeholder="Full name as on ID"
                  required
                  className="w-full rounded-xl border border-dusk-ink/15 bg-white px-4 py-3 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                />
              </div>
              {error && <p className="font-sans text-xs text-ember">{error}</p>}
              <div className="flex gap-3">
                <Button
                  variant="outline_dark"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !selectedPolicy || !deceasedName}

                >
                  {submitting ? "Creating checklist…" : "Generate checklist"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-white border border-dusk-ink/8 animate-pulse" />)}
          </div>
        )}

        {/* Active claims */}
        {!loading && activeClaims.length > 0 && (
          <div>
            <Text as="h2" variant="body_small" faded className="uppercase tracking-wider mb-3">Active Claims</Text>
            <div className="space-y-3">
              {activeClaims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="flex items-center justify-between rounded-2xl bg-white border border-dusk-ink/8 px-5 py-4 hover:border-dusk-ink/20 hover:shadow-sm transition-all"
                >
                  <div className="min-w-0">
                    <Text>{claim.deceasedFullName}</Text>
                    <Text variant="body_small" className=" mt-0.5">
                      {new Date(claim.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{claim.checklistItems.filter((i) => i.isChecked).length} of {claim.checklistItems.length} items done
                    </Text>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium ${claimStatusStyle[claim.status] ?? "bg-dusk-ink/8 text-dusk-ink/60"}`}>
                      {claimStatusLabel[claim.status] ?? claim.status}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/25">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resolved claims */}
        {!loading && resolvedClaims.length > 0 && (
          <div>
            <Text as="h2" variant="body_small" superFaded className="uppercase  mb-3">Resolved</Text>
            <div className="space-y-3">
              {resolvedClaims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="flex items-center justify-between rounded_bdr bg-white border border-dusk-ink/8 px-5 py-4 hover:border-dusk-ink/20 transition-all opacity-70"
                >
                  <div className="min-w-0">
                    <Text >{claim.deceasedFullName}</Text>
                    <Text variant="body_small" className=" mt-0.5">
                      {new Date(claim.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium ${claimStatusStyle[claim.status] ?? ""}`}>
                    {claimStatusLabel[claim.status] ?? claim.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Documents checklist info */}
        <div className="rounded_bdr bg-white border border-dusk-ink/8 p-5">
          <Text as="h2" superFaded className="uppercase mb-4">Documents You&apos;ll Need</Text>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {[
              "Certified copy of deceased's ID (BI-1663 / DHA-1663)",
              "Original death certificate",
              "Completed claim form from each insurer",
              "Claimant's own ID — certified copy",
              "Proof of relationship to deceased",
              "Bank account details for payout",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded_bdr border-2 border-dusk-ink/20" />
                <Text variant="body_small" faded>{item}</Text>
              </div>
            ))}
          </div>
          <Text variant="body_small" superFaded className=" mt-4">
            Your generated checklist will be tailored to each specific policy.
          </Text>
        </div>

        {/* Empty state */}
        {!loading && claimsList.length === 0 && !showForm && (
          <div className="rounded-2xl bg-white border border-dusk-ink/8 flex flex-col items-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/30">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8.5 10L11 12.5L15.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <Text variant="heading_sub" className=" mb-2">No claims yet</Text>
            <Text faded className="max-w-sm mb-6">
              When you need to submit a funeral claim, start here. We&apos;ll generate a step-by-step checklist.
            </Text>
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-dusk-ink px-6 py-3 font-sans text-sm font-semibold text-warm-paper hover:bg-dusk-ink/80 transition-colors"
            >
              Start a claim
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
