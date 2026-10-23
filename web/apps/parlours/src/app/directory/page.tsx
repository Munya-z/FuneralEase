"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

interface ParlourDto {
  id: string;
  name: string;
  area: string;
  province: string;
  contactName: string;
  emailAddress: string;
  phoneNumber: string;
  description?: string;
  status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export default function DirectoryPage() {
  const [parlours, setParlours] = useState<ParlourDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [area, setArea] = useState("");
  const [province, setProvince] = useState("");

  async function search() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (area) params.set("area", area);
      if (province) params.set("province", province);
      const res = await fetch(`${API_BASE}/parlours?${params}`);
      if (!res.ok) throw new Error("Could not load parlours");
      const data = await res.json();
      setParlours(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setParlours([]);
      setError(err instanceof Error ? err.message : "Could not load parlours");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen bg-warm-paper">
      {/* Header */}
      <header className="bg-dusk-ink px-6 py-5 flex items-center gap-3">
        <Link href="/" className="text-warm-paper/50 hover:text-warm-paper transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="font-serif text-lg font-semibold text-warm-paper">Parlour directory</h1>
        <Link
          href="/claim"
          className="ml-auto rounded-xl bg-candlewick px-4 py-2 font-sans text-xs font-semibold text-white"
        >
          List your parlour
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Search */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 space-y-3">
          <p className="font-sans text-xs font-semibold text-dusk-ink/40 uppercase tracking-wider">Find a parlour</p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              className="flex-1 rounded-xl border border-dusk-ink/15 bg-warm-paper px-4 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              placeholder="Area (e.g. Soweto)"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <select
              className="sm:w-48 rounded-xl border border-dusk-ink/15 bg-warm-paper px-4 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              <option value="">All provinces</option>
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button
              onClick={search}
              disabled={loading}
              className="rounded-xl bg-dusk-ink px-5 py-2.5 font-sans text-sm font-medium text-warm-paper transition hover:bg-dusk-ink/90 disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-ember/20 bg-ember/5 px-5 py-4 font-sans text-sm text-ember">
            {error}. Check that the API is running, then try again.
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm text-dusk-ink/40">Searching…</p>
          </div>
        ) : parlours.length === 0 && !error ? (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-6 py-12 text-center space-y-3">
            <p className="font-sans text-sm text-dusk-ink/60">No parlours found in this area yet.</p>
            <Link
              href="/claim"
              className="inline-block rounded-xl bg-dusk-ink/8 px-4 py-2 font-sans text-xs font-medium text-dusk-ink"
            >
              Be the first to list your parlour
            </Link>
          </div>
        ) : parlours.length > 0 ? (
          <div className="space-y-3">
            <p className="font-sans text-xs text-dusk-ink/40">
              {parlours.length} parlour{parlours.length !== 1 ? "s" : ""} found
            </p>
            {parlours.map((p) => (
              <div key={p.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-sans text-sm font-semibold text-dusk-ink">{p.name}</p>
                      <p className="font-sans text-xs text-dusk-ink/50 mt-0.5">{p.area} · {p.province}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-sage/10 px-2.5 py-0.5 font-sans text-xs font-medium text-sage">
                      Verified
                    </span>
                  </div>

                  {p.description && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.description.replace(/^Services:\s*/i, "").split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                        <span key={s} className="rounded-full bg-dusk-ink/6 px-2.5 py-0.5 font-sans text-xs text-dusk-ink/60">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-dusk-ink/6 px-5 py-3 flex items-center gap-4 bg-dusk-ink/2">
                  <div className="flex items-center gap-1.5 text-dusk-ink/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <a href={`tel:${p.phoneNumber}`} className="font-mono text-xs hover:text-dusk-ink transition-colors">
                      {p.phoneNumber}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-dusk-ink/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" />
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <a href={`mailto:${p.emailAddress}`} className="font-sans text-xs hover:text-dusk-ink transition-colors">
                      {p.emailAddress}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
