"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { legalDirectory as legalApi } from "@/lib/api";
import { Text, Button, Input } from "@/partials";


const PROVINCES = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];
const PRACTICE_TYPES = ["Attorney", "Notary", "Conveyancer", "Estate Agent", "Financial Planner", "Accountant", "Social Worker", "Psychologist", "Other"];

type FormState = {
  practiceType: string;
  firmName: string;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  area: string;
  province: string;
  description: string;
  website: string;
};

const EMPTY: FormState = {
  practiceType: "",
  firmName: "",
  contactName: "",
  phoneNumber: "",
  emailAddress: "",
  area: "",
  province: "",
  description: "",
  website: "",
};

export default function LegalDirectorySubmitPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function setField(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await legalApi.submit({
        practiceType: form.practiceType,
        firmName: form.firmName,
        contactName: form.contactName,
        phoneNumber: form.phoneNumber,
        emailAddress: form.emailAddress,
        area: form.area,
        province: form.province,
        description: form.description,
        website: form.website || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="w-full">
        <AppHeader title="Submit Your Practice" />
        <div className="px-4 py-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <Text variant="heading_sub" className="mb-2">Listing submitted!</Text>
          <Text faded className="max-w-xs leading-relaxed">
            Thank you. Your practice will be reviewed and listed in the directory within 1–2 business days.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AppHeader title="Submit Your Practice" />

      <div className="px-6 py-6 space-y-4">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light" >List your practice</Text>
          <Text color="light" variant="body_small">
            Help families in need find professional support during difficult times.
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <Text superFaded variant="body_small" className="uppercase tracking-wider">Practice details</Text>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Practice type</label>
              <select
                value={form.practiceType}
                onChange={setField("practiceType")}
                required
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              >
                <option value="">Select type…</option>
                {PRACTICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Input
                label="Firm / practice name"
                type="text"
                value={form.firmName}
                onChange={setField("firmName")}
                placeholder="e.g. Dlamini Attorneys Inc."
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Contact person name"
                type="text"
                value={form.contactName}
                onChange={setField("contactName")}
                placeholder="e.g. Thabo Dlamini"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Description</label>
              <textarea
                value={form.description}
                onChange={setField("description")}
                placeholder="Brief description of services offered…"
                rows={3}
                required
                className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <Text variant="body_small" superFaded className="uppercase tracking-wider">Contact & location</Text>

            <div className="space-y-1">
              <Input
                label="Phone number"
                variant="phone"
                type="tel"
                value={form.phoneNumber}
                onChange={setField("phoneNumber")}
                placeholder="e.g. 011 123 4567"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Email Address"
                type="email"
                value={form.emailAddress}
                onChange={setField("emailAddress")}
                placeholder="e.g. info@firm.co.za"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Website {optional}"
                type="url"
                value={form.website}
                onChange={setField("website")}
                placeholder="https://…"
                className="w-full"
              />
            </div>

            <div className="space-y-1">

              <Input
                label="Area / suburb"
                type="text"
                value={form.area}
                onChange={setField("area")}
                placeholder="e.g. Sandton"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Province</label>
              <select
                value={form.province}
                onChange={setField("province")}
                required
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              >
                <option value="">Select province…</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-ember/10 border border-ember/20 px-4 py-3">
              <Text className="text-ember">{error}</Text>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Submitting…" : "Submit listing"}
          </Button>

          <Text variant="body_small" className="text-center pb-2">
            Listings are reviewed before going live.
          </Text>
        </form>
      </div>
    </div>
  );
}
