"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

interface ParlourDto {
  id: string;
  name: string;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  area: string;
  province: string;
  description?: string;
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PendingReview: { label: "Under review", className: "bg-candlewick/10 text-candlewick" },
  Active: { label: "Live", className: "bg-sage/10 text-sage" },
  Rejected: { label: "Rejected", className: "bg-ember/10 text-ember" },
};

export default function ManagePage() {
  const [email, setEmail] = useState("");
  const [listings, setListings] = useState<ParlourDto[] | null>(null);
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [editing, setEditing] = useState<ParlourDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLooking(true);
    setLookupError("");
    setListings(null);
    try {
      const res = await fetch(`${API_BASE}/parlours/my-listings?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Could not fetch listings.");
      const data: ParlourDto[] = await res.json();
      setListings(data);
    } catch {
      setLookupError("No listings found for that email address.");
    } finally {
      setLooking(false);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API_BASE}/parlours/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactEmail: email,
          name: editing.name,
          contactName: editing.contactName,
          phoneNumber: editing.phoneNumber,
          area: editing.area,
          province: editing.province,
          description: editing.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to save changes.");
      const updated: ParlourDto = await res.json();
      setListings((prev) => prev?.map((l) => l.id === updated.id ? updated : l) ?? [updated]);
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-dusk-ink/15 bg-white px-4 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20";

  return (
    <main className="min-h-screen bg-warm-paper">
      <header className="bg-dusk-ink px-6 py-5 flex items-center gap-3">
        <Link href="/" className="text-warm-paper/50 hover:text-warm-paper transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="font-serif text-lg font-semibold text-warm-paper">Manage your listing</h1>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
        {/* Email lookup */}
        <form onSubmit={lookup} className="space-y-3">
          <p className="font-sans text-sm text-dusk-ink/60">
            Enter the email address used when submitting your listing.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@yourparlour.co.za"
              className="flex-1 rounded-xl border border-dusk-ink/15 bg-white px-4 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
            />
            <button
              type="submit"
              disabled={looking}
              className="rounded-xl bg-dusk-ink px-5 py-2.5 font-sans text-sm font-semibold text-warm-paper disabled:opacity-50"
            >
              {looking ? "…" : "Find"}
            </button>
          </div>
          {lookupError && <p className="font-sans text-xs text-ember">{lookupError}</p>}
        </form>

        {saved && (
          <div className="rounded-xl bg-sage/10 border border-sage/20 px-4 py-3">
            <p className="font-sans text-sm text-sage">Changes saved. Your listing is back in review.</p>
          </div>
        )}

        {/* Listings */}
        {listings !== null && listings.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6 text-center">
            <p className="font-sans text-sm text-dusk-ink/50">No listings found for this email.</p>
            <Link href="/claim" className="mt-3 inline-block font-sans text-xs font-medium text-dusk-ink underline">
              Submit a listing
            </Link>
          </div>
        )}

        {listings?.map((listing) => {
          const status = statusConfig[listing.status] ?? { label: listing.status, className: "bg-dusk-ink/8 text-dusk-ink/60" };
          return (
            <div key={listing.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="p-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-sans text-sm font-semibold text-dusk-ink">{listing.name}</p>
                  <p className="font-sans text-xs text-dusk-ink/50">{listing.area}, {listing.province}</p>
                  {listing.description && (
                    <p className="font-sans text-xs text-dusk-ink/40 mt-1 italic">{listing.description}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
              </div>

              {listing.status === "Rejected" && (
                <div className="px-5 pb-4">
                  <p className="font-sans text-xs text-ember">
                    Your listing was rejected. Update the details and resubmit for review.
                  </p>
                </div>
              )}

              <div className="border-t border-dusk-ink/6 px-5 py-3">
                <button
                  onClick={() => { setEditing({ ...listing }); setSaveError(""); }}
                  className="font-sans text-xs font-medium text-dusk-ink hover:text-dusk-ink/70 transition-colors"
                >
                  Edit listing
                </button>
              </div>
            </div>
          );
        })}

        {/* Edit form */}
        {editing && (
          <form onSubmit={saveEdit} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm font-semibold text-dusk-ink">Edit listing</p>
              <button type="button" onClick={() => setEditing(null)} className="font-sans text-xs text-dusk-ink/50">Cancel</button>
            </div>

            {[
              { label: "Business name", field: "name" as const, type: "text" },
              { label: "Contact name", field: "contactName" as const, type: "text" },
              { label: "Phone number", field: "phoneNumber" as const, type: "tel" },
              { label: "Service area", field: "area" as const, type: "text" },
            ].map(({ label, field, type }) => (
              <div key={field} className="space-y-1">
                <label className="font-sans text-xs font-medium text-dusk-ink/60">{label}</label>
                <input
                  type={type}
                  required
                  value={editing[field]}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, [field]: e.target.value } : null)}
                  className={inputClass}
                />
              </div>
            ))}

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Province</label>
              <select
                value={editing.province}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, province: e.target.value } : null)}
                className={inputClass}
              >
                {PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Description (optional)</label>
              <textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, description: e.target.value } : null)}
                className={inputClass}
              />
            </div>

            {saveError && <p className="font-sans text-xs text-ember">{saveError}</p>}

            <p className="font-sans text-xs text-dusk-ink/40">
              Saving will put your listing back into review. It will be re-approved within 2 business days.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-dusk-ink py-2.5 font-sans text-xs font-semibold text-warm-paper disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
