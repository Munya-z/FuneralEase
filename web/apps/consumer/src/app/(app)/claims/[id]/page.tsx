"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { AppHeader } from "@/components/AppHeader";
import { claims as claimsApi, type ClaimDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRef } from "react";
import { Text, Button } from "@/partials";

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [claim, setClaim] = useState<ClaimDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    claimsApi
      .getChecklist(token, id)
      .then(setClaim)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleItem(itemId: string, current: boolean) {
    const token = getToken();
    if (!token || !claim) return;
    const next = !current;
    setClaim((c) =>
      c
        ? {
          ...c,
          checklistItems: c.checklistItems.map((i) =>
            i.id === itemId ? { ...i, isChecked: next } : i
          ),
        }
        : c
    );
    await claimsApi.updateItem(token, id, itemId, next);
  }

  async function uploadDocument(file: File) {
    const token = getToken();
    if (!token || !claim) return;
    setUploading(true);
    try {
      const { uploadUrl, storageKey } = await claimsApi.requestDocumentUpload(token, id, file.name, file.type);
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      // Refresh claim to show new document
      const updated = await claimsApi.getChecklist(token, id);
      setClaim(updated);
    } catch {
      setError("Document upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function downloadDocument(storageKey: string) {
    const token = getToken();
    if (!token) return;
    const { downloadUrl } = await claimsApi.getDocumentDownloadUrl(token, id, storageKey);
    window.open(downloadUrl, "_blank");
  }

  async function completeClaim() {
    const token = getToken();
    if (!token) return;
    setCompleting(true);
    try {
      await claimsApi.complete(token, id);
      setClaim((c) => (c ? { ...c, status: "Submitted" } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete claim");
    } finally {
      setCompleting(false);
    }
  }

  const required = claim?.checklistItems.filter((i) => i.itemType === "Required") ?? [];
  const optional = claim?.checklistItems.filter((i) => i.itemType === "Optional") ?? [];
  const allRequiredDone = required.every((i) => i.isChecked);
  const progress = claim ? Math.round((claim.checklistItems.filter((i) => i.isChecked).length / claim.checklistItems.length) * 100) : 0;
  const isEditable = claim?.status === "InProgress";

  const TIMELINE = [
    { key: "InProgress", label: "In progress" },
    { key: "Submitted", label: "Submitted" },
    { key: "UnderReview", label: "Under review" },
    { key: "Outcome", label: "Outcome" },
  ] as const;

  function timelineStep(status: string): number {
    const map: Record<string, number> = {
      InProgress: 0, Submitted: 1, UnderReview: 2, Approved: 3, Rejected: 3,
    };
    return map[status] ?? 0;
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      InProgress: "bg-candlewick/10 text-candlewick",
      Submitted: "bg-dusk-ink/10 text-dusk-ink",
      UnderReview: "bg-dusk-ink/10 text-dusk-ink",
      Approved: "bg-sage/10 text-sage",
      Rejected: "bg-ember/10 text-ember",
    };
    return map[s] ?? "bg-dusk-ink/8 text-dusk-ink/60";
  };

  const statusText = (s: string) => {
    const map: Record<string, string> = {
      InProgress: "In progress",
      Submitted: "Submitted",
      UnderReview: "Under review",
      Approved: "Approved",
      Rejected: "Rejected",
    };
    return map[s] ?? s;
  };

  return (
    <div className="min-h-screen bg-warm-paper">
      <AppHeader title="Claim checklist" />

      <div className="w-full px-6 py-4 space-y-4">
        {loading && <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}</div>}

        {error && <Text className="text-ember">{error}</Text>}

        {claim && (
          <>
            {/* Status timeline */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Text >{claim.deceasedFullName}</Text>
                <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${statusBadge(claim.status)}`}>
                  {statusText(claim.status)}
                </span>
              </div>
              {/* Step indicators */}
              <div className="flex items-center gap-0">
                {TIMELINE.map((step, idx) => {
                  const currentStep = timelineStep(claim.status);
                  const isActive = idx === currentStep;
                  const isDone = idx < currentStep;
                  const isOutcome = step.key === "Outcome";
                  const outcomeLabel = isOutcome && (claim.status === "Approved" || claim.status === "Rejected")
                    ? statusText(claim.status) : step.label;
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${isDone ? "bg-sage text-white"
                          : isActive ? (claim.status === "Rejected" ? "bg-ember text-white" : "bg-dusk-ink text-white")
                            : "bg-dusk-ink/10 text-dusk-ink/30"
                          }`}>
                          {isDone ? (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : idx + 1}
                        </div>
                        <Text className={`font-sans text-[10px] whitespace-nowrap ${isActive ? "text-dusk-ink font-medium" : "text-dusk-ink/40"}`}>
                          {outcomeLabel}
                        </Text>
                      </div>
                      {idx < TIMELINE.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentStep ? "bg-sage" : "bg-dusk-ink/10"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              {(claim.status === "UnderReview" || claim.status === "Approved" || claim.status === "Rejected") && (
                <Text variant="body_small" faded>
                  {claim.status === "UnderReview" && "Our team is reviewing your claim. We'll notify you when there's an update."}
                  {claim.status === "Approved" && "Your claim has been approved. Expect payment within 5–7 business days."}
                  {claim.status === "Rejected" && "Your claim was not approved. Please contact support for more information."}
                </Text>
              )}
            </div>

            {/* Progress bar (only while editable) */}
            {isEditable && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Text variant="body_small" faded  >Checklist progress</Text>
                  <Text variant="body_small_sec" faded  >{claim.checklistItems.filter(i => i.isChecked).length}/{claim.checklistItems.length} items</Text>
                </div>
                <div className="h-1.5 rounded-full bg-dusk-ink/10 overflow-hidden">
                  <div className="h-full rounded-full bg-sage transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}


            {/* Required items */}
            <div className="space-y-2">
              <Text variant="body_small" className=" uppercase ">Required</Text>
              {required.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id, item.isChecked)}
                  disabled={!isEditable}
                  className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex items-start gap-3 text-left transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.isChecked ? "border-sage bg-sage" : "border-dusk-ink/25"}`}>
                    {item.isChecked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <Text className={`${item.isChecked ? "text-dusk-ink/40 line-through" : "text-dusk-ink"}`}>
                    {item.description}
                  </Text>
                </button>
              ))}
            </div>

            {/* Optional items */}
            {optional.length > 0 && (
              <div className="space-y-2">
                <Text variant="body_small" className=" uppercase ">Optional</Text>
                {optional.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id, item.isChecked)}
                    disabled={!isEditable}
                    className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex items-start gap-3 text-left transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${item.isChecked ? "border-dusk-ink/40 bg-dusk-ink/40" : "border-dusk-ink/20"}`}>
                      {item.isChecked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <Text className={` ${item.isChecked ? "text-dusk-ink/40 line-through" : "text-dusk-ink/70"}`}>
                      {item.description}
                    </Text>
                  </button>
                ))}
              </div>
            )}

            {/* Documents */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Text variant="body_small" faded className="uppercase tracking-wider">
                  Supporting documents
                </Text>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}

                >
                  {uploading ? "Uploading…" : "+ Add"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(f); e.target.value = ""; }}
                />
              </div>
              {claim.documents.length === 0 ? (
                <Text variant="body_small" superFaded >
                  No documents uploaded yet. Add death certificates, ID copies, or policy documents.
                </Text>
              ) : (
                <div className="space-y-2">
                  {claim.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Text variant="body_small" >{doc.originalFileName}</Text>
                        <Text variant="body_small" superFaded >
                          {new Date(doc.uploadedAt).toLocaleDateString("en-ZA")}
                        </Text>
                      </div>
                      <Button
                        onClick={() => downloadDocument(doc.storageKey)}
                        className="flex-shrink-0"
                      >
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete button */}
            {isEditable && (
              <Button
                onClick={completeClaim}
                disabled={!allRequiredDone || completing}

              >
                {completing ? "Submitting…" : allRequiredDone ? "Mark as submitted" : `${required.filter(i => !i.isChecked).length} required item${required.filter(i => !i.isChecked).length === 1 ? "" : "s"} remaining`}
              </Button>
            )}
            {error && <Text variant="body_small" className="text-ember">{error}</Text>}
          </>
        )}
      </div>
    </div>
  );
}
