"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearTokens, getToken, getHouseholdId } from "@/lib/auth";
import { households as householdsApi } from "@/lib/api";
import { Input, Text, Button } from "@/partials";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<"warn" | "confirm">("warn");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const CONFIRM_PHRASE = "delete my account";

  async function handleDelete() {
    if (confirmText.toLowerCase() !== CONFIRM_PHRASE) return;
    setDeleting(true);
    setError("");
    try {
      const token = getToken();
      const householdId = getHouseholdId();
      if (token && householdId) {
        // Export data before deletion so user has a copy (non-blocking)
        householdsApi.exportData(token, householdId).then((data) => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "funeralease-my-data.json";
          a.click();
          URL.revokeObjectURL(url);
        }).catch(() => null);

        // Soft-delete the household via API
        await householdsApi.deleteAccount(token, householdId);
      }
      clearTokens();
      router.replace("/deleted");
    } catch {
      setError("Something went wrong. Please try again or contact support.");
      setDeleting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-ember px-5 pt-10 pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/60 mb-3 hover:text-white/90 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Text as="span" variant="body_small" color="light">Back</Text>
        </button>
        <Text variant="heading_sub" color="light">Delete account</Text>
        <Text color="light" variant="body_small" className="mt-1">
          This action cannot be undone.
        </Text>
      </div>

      <div className="px-4 py-4 space-y-4">
        {step === "warn" && (
          <>
            <div className="rounded-2xl bg-ember/8 ring-1 ring-ember/20 p-4 space-y-3">
              <Text className="text-ember">Before you go</Text>
              <ul className="space-y-2">
                {[
                  "All your policies and beneficiary records will be permanently deleted.",
                  "Any active claims will be cancelled.",
                  "Emergency access contacts will lose access.",
                  "Your referral history will be removed.",
                  "This cannot be reversed once confirmed.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ember mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="small_dark_txt">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
              <Text superFaded variant="body_small" >
                Under POPIA, you have the right to request deletion. We'll export your data automatically before removing your account.
              </Text>
              <Text superFaded variant="body_small" >
                Prefer to keep your data? You can download it from the More page instead.
              </Text>
            </div>

            <button
              onClick={() => setStep("confirm")}
              className="w-full rounded-xl bg-ember py-3 font-sans text-sm font-semibold text-white"
            >
              I understand, continue
            </button>
            <Button
              onClick={() => router.back()}
              className="w-full"
              variant="outline"
            >
              Keep my account
            </Button>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <Text>Confirm deletion</Text>
              <Text variant="body_small" faded >
                Type <span className="font-mono font-semibold text-ember">{CONFIRM_PHRASE}</span> below to confirm.
              </Text>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="w-full  focus:outline-none focus:ring-2 focus:ring-ember/30"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-ember/10 border border-ember/20 px-4 py-3">
                <Text className="text-ember">{error}</Text>
              </div>
            )}

            <Button
              variant="delete"
              onClick={handleDelete}
              disabled={confirmText.toLowerCase() !== CONFIRM_PHRASE || deleting}
              className="w-full"
            >
              {deleting ? "Deleting account…" : "Permanently delete my account"}
            </Button>
            <Button
              onClick={() => setStep("warn")}
              className="w-full "
            >
              Go back
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
