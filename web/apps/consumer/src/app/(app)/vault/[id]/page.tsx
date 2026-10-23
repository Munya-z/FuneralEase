"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { policies as policiesApi, type PolicyDto, type PaymentHistoryEntryDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Text, Button, Input } from "@/partials";

const statusMap: Record<string, { label: string; className: string }> = {
  Current: { label: "Paid", className: "bg-sage/10 text-sage" },
  DueSoon: { label: "Due soon", className: "bg-candlewick/10 text-candlewick" },
  Overdue: { label: "Overdue", className: "bg-ember/10 text-ember" },
  Lapsed: { label: "Lapsed", className: "bg-ember text-white" },
};

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [policy, setPolicy] = useState<PolicyDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Beneficiary form
  const [showForm, setShowForm] = useState(false);
  const [newBen, setNewBen] = useState({ fullName: "", relationship: "", benefitPercentage: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEntryDto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPolicy = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const list = await policiesApi.list(token);
    const found = list.find((p) => p.id === id) ?? null;
    setPolicy(found);
  }, [id]);

  const loadPaymentHistory = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const history = await policiesApi.getPaymentHistory(token, id);
      setPaymentHistory(history);
    } catch {
      // non-critical
    }
  }, [id]);

  useEffect(() => {
    Promise.all([loadPolicy(), loadPaymentHistory()]).finally(() => setLoading(false));
  }, [loadPolicy, loadPaymentHistory]);

  async function removeBeneficiary(beneficiaryId: string) {
    const token = getToken();
    if (!token || !policy) return;
    setRemovingId(beneficiaryId);
    try {
      const updated = await policiesApi.removeBeneficiary(token, policy.id, beneficiaryId);
      setPolicy(updated);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !policy) return;
    const token = getToken();
    if (!token) return;
    setUploading(true);
    setUploadError("");
    try {
      const { uploadUrl } = await policiesApi.requestDocumentUpload(token, policy.id, file.name, file.type);
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      await loadPolicy();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function addBeneficiary(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !policy) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await policiesApi.addBeneficiary(
        token,
        policy.id,
        newBen.fullName,
        newBen.relationship,
        parseFloat(newBen.benefitPercentage),
      );
      setPolicy(updated);
      setShowForm(false);
      setNewBen({ fullName: "", relationship: "", benefitPercentage: "" });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to add beneficiary");
    } finally {
      setSaving(false);
    }
  }

  async function downloadDocument(storageKey: string) {
    const token = getToken();
    if (!token || !policy) return;
    setDownloadingKey(storageKey);
    try {
      const { downloadUrl } = await policiesApi.getDocumentDownloadUrl(token, policy.id, storageKey);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingKey(null);
    }
  }

  const totalAllocation = policy?.beneficiaries.reduce((s, b) => s + b.benefitPercentage, 0) ?? 0;
  const remaining = 100 - totalAllocation;

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white border-b border-dusk-ink/8 h-20 animate-pulse" />
        <div className="px-6 py-6 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="w-full px-6 py-10 text-center">
        <Text superFaded >Policy not found.</Text>
        <Link href="/vault" className="mt-4 inline-block font-sans text-xs font-medium text-dusk-ink underline">
          Back to vault
        </Link>
      </div>
    );
  }

  const status = statusMap[policy.lapseStatus];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-dusk-ink/8 px-6 py-5">
        <Button onClick={() => router.back()} className="flex items-center gap-1.5 text-warm-paper/50 mb-3 hover:text-warm-paper/80 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-sans text-xs">Back</span>
        </Button>
        <Text as="h1" variant="heading_sub">{policy.insurerName}</Text>
        <Text variant="body_small" superFaded className="mt-0.5">{policy.policyNumber}</Text>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Policy summary */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="body_small" superFaded>Monthly premium</Text>
              <Text variant="heading_sub" >R{policy.premiumAmount.toLocaleString()}</Text>
            </div>
            <Text as="span" variant="body_small" className={`rounded-full ${status.className}`}>
              {status.label}
            </Text>
          </div>
          <div className="flex items-center justify-between text-xs">
            <Text as="span" variant="body" superFaded>Next due</Text>
            <Text as="span" variant="heading_sec" >{policy.nextDueDate}</Text>
          </div>
          <div className="flex items-center justify-between text-xs">
            <Text as="span" variant="body" superFaded>Added</Text>
            <Text as="span" variant="heading_sec" >{new Date(policy.createdAt).toLocaleDateString("en-ZA")}</Text>
          </div>
        </div>

        {/* Beneficiaries */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Text variant="body_small" superFaded className="uppercase">Beneficiaries</Text>
            {remaining > 0 && (
              <Button
                onClick={() => setShowForm(true)}
                variant="sec"
              >
                + Add
              </Button>
            )}
          </div>

          {/* Allocation bar */}
          {policy.beneficiaries.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <div className="h-2 rounded-full bg-dusk-ink/6 overflow-hidden flex">
                {policy.beneficiaries.map((b, i) => (
                  <div
                    key={b.id}
                    className={`h-full ${i % 2 === 0 ? "bg-dusk-ink/40" : "bg-sage/60"}`}
                    style={{ width: `${b.benefitPercentage}%` }}
                  />
                ))}
                {remaining > 0 && <div className="h-full bg-dusk-ink/8 flex-1" />}
              </div>
              <div className="space-y-2">
                {policy.beneficiaries.map((b) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <div>
                      <Text >{b.fullName}</Text>
                      <Text variant="body_small" faded>{b.relationship}</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Text variant="body_sec">{b.benefitPercentage}%</Text>
                      <button
                        onClick={() => removeBeneficiary(b.id)}
                        disabled={removingId === b.id}
                        className="text-ember/60 hover:text-ember transition-colors disabled:opacity-40 p-1"
                        aria-label="Remove beneficiary"
                      >
                        {removingId === b.id ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {remaining > 0 && (
                <Text variant="body_small" superFaded>{remaining}% unallocated</Text>
              )}
            </div>
          )}

          {policy.beneficiaries.length === 0 && !showForm && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 text-center">
              <Text variant="body_small" faded className="mb-3">No beneficiaries named yet</Text>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-dusk-ink px-5 py-2.5 font-sans text-xs font-semibold text-warm-paper"
              >
                Add beneficiary
              </button>
            </div>
          )}

          {showForm && (
            <form onSubmit={addBeneficiary} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <Text variant="body_small">Add beneficiary</Text>
              {[
                { label: "Full name", field: "fullName", type: "text", placeholder: "As on ID document" },
                { label: "Relationship", field: "relationship", type: "text", placeholder: "e.g. Spouse, Child, Parent" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field} className="space-y-1">
                  <Input
                    label={label}
                    type={type}
                    required
                    value={newBen[field as keyof typeof newBen]}
                    onChange={(e) => setNewBen((b) => ({ ...b, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="font-sans text-xs font-medium text-dusk-ink/60">
                  Benefit % <span className="text-dusk-ink/30">(max {remaining}% remaining)</span>
                </label>
                <Input
                  type="number"
                  required
                  min="1"
                  max={remaining}
                  step="1"
                  value={newBen.benefitPercentage}
                  onChange={(e) => setNewBen((b) => ({ ...b, benefitPercentage: e.target.value }))}
                  placeholder={`e.g. ${remaining}`}
                  className="w-full"
                />
              </div>
              {saveError && <p className="font-sans text-xs text-ember">{saveError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-dusk-ink/15 py-2.5 font-sans text-xs font-medium text-dusk-ink/60">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-xl bg-dusk-ink py-2.5 font-sans text-xs font-semibold text-warm-paper disabled:opacity-50">
                  {saving ? "Saving…" : "Add"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Text variant="body_small" className="uppercase">
              Documents ({policy.documents.length})
            </Text>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="font-sans text-xs font-medium text-dusk-ink hover:text-dusk-ink/70 transition-colors disabled:opacity-40"
            >
              {uploading ? "Uploading…" : "+ Attach"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          {uploadError && <p className="font-sans text-xs text-ember px-1">{uploadError}</p>}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
            {policy.documents.length === 0 ? (
              <div className="p-4">
                <Text superFaded variant="body_small">
                  Attach your policy schedule or premium receipt (PDF or image).
                </Text>
              </div>
            ) : (
              <div className="divide-y divide-dusk-ink/5">
                {policy.documents.map((doc) => (
                  <div key={doc.storageKey} className="flex items-center gap-3 px-4 py-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-dusk-ink/30">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <Text >{doc.originalFileName}</Text>
                      <Text superFaded variant="body_small_sec" >
                        {new Date(doc.uploadedAt).toLocaleDateString("en-ZA")}
                      </Text>
                    </div>
                    <button
                      onClick={() => downloadDocument(doc.storageKey)}
                      disabled={downloadingKey === doc.storageKey}
                      className="flex-shrink-0 rounded-lg border border-dusk-ink/15 px-2.5 py-1 font-sans text-xs text-dusk-ink hover:bg-dusk-ink/4 transition-colors disabled:opacity-40"
                    >
                      {downloadingKey === doc.storageKey ? "…" : "Open"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment history */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Text superFaded variant="body_small" className="uppercase ">
              Payment history
            </Text>
            {paymentHistory.length > 0 && (
              <Text as="span" variant="body_small_sec" >{paymentHistory.length} record{paymentHistory.length !== 1 ? "s" : ""}</Text>
            )}
          </div>
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
            {paymentHistory.length === 0 ? (
              <div className="p-4">
                <Text variant="body_small" superFaded > No payments recorded yet.</Text>
              </div>
            ) : (
              <div className="divide-y divide-dusk-ink/5">
                {paymentHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <Text >
                        {new Date(entry.paidForDate + "T00:00:00").toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
                      </Text>
                      <Text variant="body_small_sec" superFaded >
                        recorded {new Date(entry.recordedAt).toLocaleDateString("en-ZA")}
                      </Text>
                    </div>
                    <Text variant="heading_sec" >R{entry.amountPaid.toLocaleString()}</Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <Text variant="body_small" className=" uppercase ">Actions</Text>
          <Link
            href={`/vault/add?edit=${policy.id}`}
            className="flex items-center gap-3 px-4 py-3.5 border-t border-dusk-ink/6 transition hover:bg-dusk-ink/4"
          >
            <span className="font-sans text-sm text-dusk-ink flex-1">Edit policy details</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/25">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href={`/claims?policyId=${policy.id}`}
            className="flex items-center gap-3 px-4 py-3.5 border-t border-dusk-ink/6 transition hover:bg-dusk-ink/4"
          >
            <span className="font-sans text-sm text-dusk-ink flex-1">Start a claim on this policy</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/25">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
