"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { fundraisers as fundraisersApi, type FundraiserDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Input, Text, Button } from "@/partials";

type FormState = {
  title: string;
  story: string;
  goalAmount: string;
  deceasedFullName: string;
};

const EMPTY_FORM: FormState = { title: "", story: "", goalAmount: "", deceasedFullName: "" };

function raisedAmount(item: FundraiserDto) {
  return Number(item.totalCollected ?? 0);
}

function goalAmount(item: FundraiserDto) {
  return Number(item.goalAmount ?? 0);
}

export default function FundraiserPage() {
  const [items, setItems] = useState<FundraiserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fundraisersApi
      .list(token)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => {
        setItems([]);
        setLoadError(err instanceof Error ? err.message : "Failed to load fundraisers");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await fundraisersApi.create(token, {
        title: form.title,
        story: form.story,
        goalAmount: Number(form.goalAmount),
        deceasedFullName: form.deceasedFullName,
      });
      setItems((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create fundraiser");
    } finally {
      setSubmitting(false);
    }
  }

  function statusBadge(status: string) {
    if (status === "Active") return "bg-sage/10 text-sage border-sage/20";
    return "bg-dusk-ink/8 text-dusk-ink/60 border-dusk-ink/10";
  }

  return (
    <div className="w-full">
      <AppHeader
        title="Fundraising"
        action={
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError("");
              setForm(EMPTY_FORM);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-dusk-ink text-warm-paper"
            aria-label="Create fundraiser"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        }
      />

      <div className="px-6 py-6 space-y-4">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <p className="font-serif text-base font-semibold text-warm-paper">Community support in difficult times</p>
          <p className="font-sans text-xs text-warm-paper/60 leading-relaxed">
            Create a fundraiser for your loved one&apos;s funeral. Share the link and let your community help.
          </p>
        </div>

        {loadError && (
          <div className="rounded-2xl border border-ember/20 bg-ember/5 px-4 py-3 font-sans text-sm text-ember">
            {loadError}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm font-semibold text-dusk-ink">New fundraiser</p>
              <button type="button" onClick={() => setShowForm(false)} className="text-dusk-ink/40 hover:text-dusk-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {[
              { label: "Title", key: "title" as const, placeholder: "e.g. Help us give Mama a dignified farewell", type: "text" },
              { label: "Name of the deceased", key: "deceasedFullName" as const, placeholder: "Full name", type: "text" },
              { label: "Goal amount (ZAR)", key: "goalAmount" as const, placeholder: "e.g. 15000", type: "number" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="space-y-1">
                <label className="font-sans text-xs font-medium text-dusk-ink/60">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  min={type === "number" ? 1 : undefined}
                  className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                />
              </div>
            ))}

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Story</label>
              <textarea
                value={form.story}
                onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
                placeholder="Share who your loved one was and how the community can help…"
                rows={4}
                required
                className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              />
            </div>

            {error && <p className="font-sans text-xs text-ember">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-dusk-ink/15 py-2.5 font-sans text-xs font-medium text-dusk-ink/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-dusk-ink py-2.5 font-sans text-xs font-semibold text-warm-paper disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create fundraiser"}
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-dusk-ink/6 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-4">
              <span className="text-2xl" aria-hidden>
                🤝
              </span>
            </div>
            <p className="font-serif text-lg font-semibold text-dusk-ink mb-2">No fundraisers yet</p>
            <p className="font-sans text-sm text-dusk-ink/50 max-w-xs mb-6">
              Start a fundraiser to invite your community to contribute to funeral costs.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setError("");
              }}
              className="rounded-xl bg-dusk-ink px-6 py-3 font-sans text-sm font-semibold text-warm-paper"
            >
              Create fundraiser
            </button>
          </div>
        )}

        {!loading &&
          items.map((item) => {
            const raised = raisedAmount(item);
            const goal = goalAmount(item);
            const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
            return (
              <Link
                key={item.id}
                href={`/fundraiser/${item.id}`}
                className="block rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3 transition hover:ring-dusk-ink/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-sm font-semibold text-dusk-ink truncate">{item.title}</p>
                    <p className="font-sans text-xs text-dusk-ink/50 mt-0.5">In memory of {item.deceasedFullName}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium flex-shrink-0 ${statusBadge(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="h-2 rounded-full bg-dusk-ink/8 overflow-hidden">
                    <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-dusk-ink/60">R{raised.toLocaleString()} raised</p>
                    <p className="font-mono text-xs text-dusk-ink/40">
                      of R{goal.toLocaleString()} · {pct}%
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
