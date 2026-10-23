"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { fundraisers as fundraisersApi, type FundraiserDetailDto } from "@/lib/api";
import { Input, Text, Button } from "@/partials";

export default function FundraiserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<FundraiserDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contributed, setContributed] = useState(false);
  const [contributeError, setContributeError] = useState("");

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fundraisersApi
      .get(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load fundraiser"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setContributeError("");
    try {
      await fundraisersApi.contribute(id, {
        donorName: donorName.trim(),
        amountCents: Math.round(Number(amount) * 100),
        message: message.trim() || undefined,
      });
      const refreshed = await fundraisersApi.get(id);
      setData(refreshed);
      setContributed(true);
      setDonorName("");
      setAmount("");
      setMessage("");
    } catch (err) {
      setContributeError(err instanceof Error ? err.message : "Failed to contribute");
    } finally {
      setSubmitting(false);
    }
  }

  const raised = Number(data?.totalCollected ?? 0);
  const goal = Number(data?.goalAmount ?? 0);
  const pct = data && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const contributions = data?.contributions ?? [];

  return (
    <div className="w-full">
      <AppHeader title={data?.title ?? "Fundraiser"} />

      <div className="px-6 py-6 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-dusk-ink/6 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-ember/10 border border-ember/20 px-4 py-4">
            <p className="font-sans text-sm text-ember">{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
              <p className="font-mono text-xs text-warm-paper/40 uppercase tracking-widest">In memory of</p>
              <p className="font-serif text-xl font-semibold text-warm-paper">{data.deceasedFullName}</p>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-2xl font-semibold text-dusk-ink">R{raised.toLocaleString()}</p>
                  <p className="font-sans text-xs text-dusk-ink/50 mt-0.5">
                    raised of R{goal.toLocaleString()} goal
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${data.status === "Active"
                    ? "bg-sage/10 text-sage border border-sage/20"
                    : "bg-dusk-ink/8 text-dusk-ink/60 border border-dusk-ink/10"
                    }`}
                >
                  {data.status}
                </span>
              </div>
              <div className="h-3 rounded-full bg-dusk-ink/8 overflow-hidden">
                <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="font-sans text-xs text-dusk-ink/50 text-center">
                {pct}% funded · {contributions.length} contribution
                {contributions.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
              <p className="font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Story</p>
              <p className="font-sans text-sm text-dusk-ink/80 leading-relaxed whitespace-pre-line">{data.story}</p>
            </div>

            {data.status === "Active" && !contributed && (
              <form onSubmit={handleContribute} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
                <p className="font-sans text-sm font-semibold text-dusk-ink">Make a contribution</p>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Your name</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Thabo Dlamini"
                    required
                    className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Amount (ZAR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-dusk-ink/40">R</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
                      required
                      min={1}
                      className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper pl-7 pr-3 py-2.5 font-mono text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Message (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="A few words of support…"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>

                {contributeError && <p className="font-sans text-xs text-ember">{contributeError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-dusk-ink py-3 font-sans text-sm font-semibold text-warm-paper disabled:opacity-50"
                >
                  {submitting ? "Processing…" : "Contribute"}
                </button>
              </form>
            )}

            {contributed && (
              <div className="rounded-2xl bg-sage/10 border border-sage/20 px-4 py-4">
                <p className="font-sans text-sm font-semibold text-sage">Thank you for your contribution!</p>
                <p className="font-sans text-xs text-dusk-ink/60 mt-0.5">
                  Your support means a great deal to the family.
                </p>
              </div>
            )}

            {contributions.length > 0 && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
                <p className="font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">
                  Contributions ({contributions.length})
                </p>
                <div className="space-y-3">
                  {contributions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start justify-between gap-2 border-b border-dusk-ink/6 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-dusk-ink">{c.donorName}</p>
                        {c.message && (
                          <p className="font-sans text-xs text-dusk-ink/50 mt-0.5 leading-relaxed">{c.message}</p>
                        )}
                        <p className="font-sans text-xs text-dusk-ink/30 mt-0.5">
                          {new Date(c.donatedAt).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-medium text-dusk-ink flex-shrink-0">
                        R{(c.amountCents / 100).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
