"use client";

import { useState } from "react";
import Link from "next/link";

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface FormState {
  name: string;
  registrationNumber: string;
  area: string;
  province: string;
  contactName: string;
  email: string;
  phone: string;
  services: string[];
}

const SERVICE_OPTIONS = [
  "Burial", "Cremation", "Repatriation", "Embalming",
  "Memorial service", "Coffin supply", "Transportation",
];

export default function ClaimListingPage() {
  const [form, setForm] = useState<FormState>({
    name: "", registrationNumber: "", area: "", province: "",
    contactName: "", email: "", phone: "", services: [],
  });
  const [step, setStep] = useState<"form" | "submitting" | "success" | "error">("form");
  const [error, setError] = useState("");

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleService(s: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(s)
        ? prev.services.filter((x) => x !== s)
        : [...prev.services, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    try {
      const res = await fetch(`${API_BASE}/parlours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contactName: form.contactName,
          phoneNumber: form.phone,
          emailAddress: form.email,
          area: form.area,
          province: form.province,
          description: form.services.length > 0 ? `Services: ${form.services.join(", ")}` : undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-dusk-ink/15 bg-white px-4 py-3 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-dusk-ink/20";

  if (step === "success") {
    return (
      <main className="min-h-screen bg-warm-paper flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-sage/15 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12L10 17L19 8" stroke="#5E8571" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-dusk-ink">Listing submitted</h2>
            <p className="font-sans text-sm text-dusk-ink/60 leading-relaxed">
              We'll review your listing and verify your registration number within 2 business days.
              You'll receive an email at <span className="font-medium text-dusk-ink">{form.email}</span>.
            </p>
          </div>
          <Link
            href="/"
            className="block w-full rounded-xl bg-dusk-ink py-3 text-center font-sans text-sm font-medium text-warm-paper"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-paper">
      {/* Header */}
      <header className="bg-dusk-ink px-6 py-5 flex items-center gap-3">
        <Link href="/" className="text-warm-paper/50 hover:text-warm-paper transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="font-serif text-lg font-semibold text-warm-paper">List your funeral home</h1>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8">
        <p className="font-sans text-sm text-dusk-ink/50 mb-6">
          Your listing is reviewed before going live. We spot-check registration numbers with CIPC.
        </p>

        {step === "error" && (
          <div className="mb-4 rounded-xl bg-ember/10 border border-ember/20 px-4 py-3">
            <p className="font-sans text-sm text-ember">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business details */}
          <div className="space-y-3">
            <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">Business details</p>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/70">Business name *</label>
              <input
                required
                type="text"
                className={inputClass}
                placeholder="e.g. Thabo Funeral Services"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/70">CIPC registration number *</label>
              <input
                required
                type="text"
                className={`${inputClass} font-mono`}
                placeholder="2024/123456/07"
                value={form.registrationNumber}
                onChange={(e) => set("registrationNumber", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-sans text-xs font-medium text-dusk-ink/70">Service area *</label>
                <input
                  required
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Soweto"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-sans text-xs font-medium text-dusk-ink/70">Province *</label>
                <select
                  required
                  className={inputClass}
                  value={form.province}
                  onChange={(e) => set("province", e.target.value)}
                >
                  <option value="">Select…</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Services offered */}
          <div className="space-y-3">
            <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">Services offered</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((s) => {
                const active = form.services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`rounded-full px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                      active
                        ? "bg-dusk-ink text-warm-paper"
                        : "bg-dusk-ink/8 text-dusk-ink/60 hover:bg-dusk-ink/15"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">Contact person</p>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/70">Full name *</label>
              <input
                required
                type="text"
                className={inputClass}
                placeholder="e.g. Thabo Dlamini"
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-sans text-xs font-medium text-dusk-ink/70">Email *</label>
                <input
                  required
                  type="email"
                  className={inputClass}
                  placeholder="info@parlour.co.za"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-sans text-xs font-medium text-dusk-ink/70">Phone *</label>
                <input
                  required
                  type="tel"
                  className={`${inputClass} font-mono`}
                  placeholder="+27 82 000 0000"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={step === "submitting"}
            className="w-full rounded-xl bg-dusk-ink py-3.5 font-sans text-sm font-semibold text-warm-paper transition hover:bg-dusk-ink/90 disabled:opacity-50"
          >
            {step === "submitting" ? "Submitting…" : "Submit listing"}
          </button>

          <p className="font-sans text-xs text-dusk-ink/30 text-center">
            By submitting you agree to our terms. Your data is handled per POPIA.
          </p>
        </form>
      </div>
    </main>
  );
}
