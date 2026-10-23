"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parlours as parloursApi } from "@/lib/api";
import { Text, Button, Input } from "@/partials";



const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

export default function ParlourSubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    phoneNumber: "",
    emailAddress: "",
    area: "",
    province: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await parloursApi.submit(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="w-full">
        <div className="bg-white border-b border-dusk-ink/8 px-6 py-5">
          <Text as="h1" variant="heading_sub" >Submitted</Text>
        </div>
        <div className="px-4 py-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-sage">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <Text variant="heading_small" className="mb-2">Listing submitted</Text>
            <Text faded className="max-w-xs">
              We'll review your parlour listing and get back to you via email within 2 business days.
            </Text>
          </div>
          <Button
            onClick={() => router.push("/parlours")}
            className="mt-2"
          >
            Back to parlours
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-dusk-ink/8 px-6 py-5">
        <Button
          onClick={() => router.back()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-sans text-xs">Back</span>
        </Button>
        <Text as="h1" className="font-serif text-2xl font-semibold text-dusk-ink">List your parlour</Text>
        <Text variant="body_small" superFaded className="mt-1">
          Reach families when they need you most.
        </Text>
      </div>

      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business info */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <Text variant="body_small" superFaded className="uppercase">
              Business details
            </Text>
            {[
              { label: "Parlour name", field: "name" as const, placeholder: "e.g. Nkosi Funeral Services", type: "text" },
              { label: "Contact person", field: "contactName" as const, placeholder: "Full name", type: "text" },
              { label: "Phone number", field: "phoneNumber" as const, placeholder: "+27 11 000 0000", type: "tel" },
              { label: "Email address", field: "emailAddress" as const, placeholder: "info@parlour.co.za", type: "email" },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field} className="space-y-1">
                <Input
                  label={label}
                  type={type}
                  required
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                />
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <Text className="font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">
              Location
            </Text>
            <div className="space-y-1">

              <Input
                label="Area / City"
                type="text"
                required
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="e.g. Soweto, Mitchells Plain"
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Province</label>
              <select
                required
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              >
                <option value="">Select province</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-1">
            <label className="font-sans text-xs font-medium text-dusk-ink/60">
              About your parlour <span className="text-dusk-ink/30">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Services offered, years in operation, special care for different faith traditions…"
              rows={4}
              className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20 resize-none"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-ember/10 border border-ember/20 px-4 py-3">
              <Text className=" text-ember">{error}</Text>
            </div>
          )}

          <Text superFaded variant="body_small" className="text-center px-2">
            All submissions are reviewed before appearing in the directory.
          </Text>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Submitting…" : "Submit listing"}
          </Button>
        </form>
      </div>
    </div>
  );
}
