"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { policies as policiesApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Text, Button, Input } from "@/partials";

function AddPolicyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(isEditing);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    insurerName: "",
    policyNumber: "",
    premiumAmount: "",
    nextDueDate: "",
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (!editId) return;
    const token = getToken();
    if (!token) return;
    policiesApi.list(token).then((list) => {
      const policy = list.find((p) => p.id === editId);
      if (policy) {
        setForm({
          insurerName: policy.insurerName,
          policyNumber: policy.policyNumber,
          premiumAmount: policy.premiumAmount.toString(),
          nextDueDate: policy.nextDueDate,
        });
      }
    }).finally(() => setInitialising(false));
  }, [editId]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = getToken();
    if (!token) { router.push("/onboarding"); return; }
    try {
      if (isEditing && editId) {
        await policiesApi.update(token, editId, {
          insurerName: form.insurerName,
          policyNumber: form.policyNumber,
          premiumAmount: parseFloat(form.premiumAmount),
          nextDueDate: form.nextDueDate,
        });
        router.push(`/vault/${editId}`);
      } else {
        await policiesApi.create(token, {
          insurerName: form.insurerName,
          policyNumber: form.policyNumber,
          premiumAmount: parseFloat(form.premiumAmount),
          nextDueDate: form.nextDueDate,
        });
        router.push("/vault");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditing ? "Failed to update policy" : "Failed to add policy");
    } finally {
      setLoading(false);
    }
  }

  const commonInsurers = [
    "1Life",
    "Absa Funeral Cover",
    "African Unity Life",
    "Assupol",
    "AVBOB",
    "Capitec Funeral Cover",
    "Clientele Life",
    "Discovery Life",
    "Doves",
    "FNB Life",
    "Guardrisk",
    "Hollard",
    "Liberty Life",
    "Lion of Africa",
    "Metropolitan Life",
    "Momentum",
    "Multiply (Momentum)",
    "Nedbank Funeral Plan",
    "Old Mutual",
    "Peermont",
    "PPS Funeral Cover",
    "Provident Life",
    "Sanlam",
    "Sanlam Indie",
    "Sanlam Sky",
    "Standard Bank Funeral Cover",
    "Ubuntu Life",
  ];

  if (initialising) {
    return (
      <div className="min-h-screen bg-warm-paper">
        <AppHeader title="Edit policy" />
        <div className="w-full px-6 py-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-dusk-ink/6 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-paper">
      <AppHeader
        title={isEditing ? "Edit policy" : "Add policy"}
      />

      <form onSubmit={handleSubmit} className="w-full px-6 py-6 space-y-5">
        {/* Insurer name */}
        <div className="space-y-1.5">
          <Input
            label="Insurer / provider"
            variant="text"
            type="text"
            value={form.insurerName}
            onChange={(e) => update("insurerName", e.target.value)}
            placeholder="e.g. AVBOB, Old Mutual, burial society"
            required
            list="insurers"
            className="w-full"
          />
          <datalist id="insurers">
            {commonInsurers.map((i) => <option key={i} value={i} />)}
          </datalist>
        </div>

        {/* Policy number */}
        <div className="space-y-1.5">
          <Input
            label="Policy number"
            variant="text"
            type="text"
            value={form.policyNumber}
            onChange={(e) => update("policyNumber", e.target.value)}
            placeholder="e.g. FP-2024-001234"
            required
            className="w-full "
          />
        </div>

        {/* Premium amount */}
        <div className="space-y-1.5">
          <label className="font-sans text-xs font-medium text-dusk-ink/60">
            Monthly premium (R)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-dusk-ink/40">
              R
            </span>
            <Input
              type="number"
              value={form.premiumAmount}
              onChange={(e) => update("premiumAmount", e.target.value)}
              placeholder="0.00"
              required
              min="1"
              step="0.01"
              className="w-full"
            />
          </div>
        </div>

        {/* Next due date */}
        <div className="space-y-1.5">
          <Input
            label="Next premium due dat"
            type="date"
            value={form.nextDueDate}
            onChange={(e) => update("nextDueDate", e.target.value)}
            required
            className="w-full "
          />
        </div>

        {!isEditing && (
          <div className="rounded-xl bg-dusk-ink/4 border border-dusk-ink/8 px-4 py-3">
            <Text faded variant="body_small">
              You can upload your policy schedule document after adding — we&apos;ll
              remind you to keep it up to date.
            </Text>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-ember/10 border border-ember/20 px-4 py-3">
            <Text variant="body_small" className="text-ember">{error}</Text>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading
            ? isEditing ? "Saving changes…" : "Adding policy…"
            : isEditing ? "Save changes" : "Add policy"}
        </Button>
      </form>
    </div>
  );
}

export default function AddPolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-paper">
          <AppHeader title="Add policy" />
          <div className="w-full px-6 py-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-dusk-ink/6 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <AddPolicyContent />
    </Suspense>
  );
}
