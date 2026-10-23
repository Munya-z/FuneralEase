"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { admin as adminApi, type AdminBurialSocietyDetailDto } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export default function BurialSocietyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<AdminBurialSocietyDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memberTab, setMemberTab] = useState<"members" | "contributions">("members");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    adminApi.getBurialSocietyDetail(token, id)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 rounded bg-dusk-ink/8 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
        </div>
        <div className="h-64 rounded-2xl bg-dusk-ink/6 animate-pulse" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8">
        <p className="font-sans text-sm text-ember">{error || "Society not found."}</p>
        <Link href="/burial-societies" className="mt-3 inline-block font-sans text-xs text-dusk-ink/50 hover:text-dusk-ink">
          ← Back to societies
        </Link>
      </div>
    );
  }

  const totalContributions = detail.recentContributions.reduce((s, c) => s + c.amountPaid, 0);

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link href="/burial-societies" className="font-sans text-xs text-dusk-ink/40 hover:text-dusk-ink mb-2 inline-block">
          ← Burial societies
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-dusk-ink">{detail.name}</h1>
            <p className="font-mono text-xs text-dusk-ink/40 mt-0.5">
              {detail.registrationNumber ? `Reg: ${detail.registrationNumber} · ` : ""}
              Created {new Date(detail.createdAt).toLocaleDateString("en-ZA")}
            </p>
          </div>
          <Link
            href={`/households/${detail.adminHouseholdId}`}
            className="rounded-xl bg-dusk-ink/6 px-3 py-1.5 font-sans text-xs font-medium text-dusk-ink hover:bg-dusk-ink/10"
          >
            View admin household →
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-5 py-4">
          <p className="font-sans text-xs text-dusk-ink/50 mb-1">Monthly contribution</p>
          <p className="font-mono text-xl font-semibold text-dusk-ink">R{detail.monthlyContributionAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-5 py-4">
          <p className="font-sans text-xs text-dusk-ink/50 mb-1">Members</p>
          <p className="font-mono text-xl font-semibold text-dusk-ink">{detail.members.length}</p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-5 py-4">
          <p className="font-sans text-xs text-dusk-ink/50 mb-1">Recent collected</p>
          <p className="font-mono text-xl font-semibold text-sage">R{totalContributions.toFixed(2)}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-dusk-ink/10">
        {(["members", "contributions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMemberTab(t)}
            className={`px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
              memberTab === t
                ? "text-dusk-ink border-b-2 border-dusk-ink"
                : "text-dusk-ink/40 hover:text-dusk-ink/70"
            }`}
          >
            {t === "members" ? `Members (${detail.members.length})` : `Contributions (${detail.recentContributions.length})`}
          </button>
        ))}
      </div>

      {/* Members table */}
      {memberTab === "members" && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          {detail.members.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-sans text-sm text-dusk-ink/40">No members yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dusk-ink/8 bg-dusk-ink/2">
                  <th className="px-5 py-3 text-left font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Mobile</th>
                  <th className="px-5 py-3 text-right font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Contributions</th>
                  <th className="px-5 py-3 text-right font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Total paid</th>
                  <th className="px-5 py-3 text-right font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dusk-ink/5">
                {detail.members.map((m) => (
                  <tr key={m.memberId} className="hover:bg-dusk-ink/2 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/households/${m.householdId}`} className="font-sans text-sm font-medium text-dusk-ink hover:text-dusk-ink/70 underline underline-offset-2">
                        {m.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-dusk-ink/50">{m.mobileNumber}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-dusk-ink/60">{m.contributionCount}</td>
                    <td className="px-5 py-3 text-right font-mono text-sm font-medium text-sage">R{m.totalContributed.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-dusk-ink/30">
                      {new Date(m.joinedAt).toLocaleDateString("en-ZA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Contributions table */}
      {memberTab === "contributions" && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          {detail.recentContributions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-sans text-sm text-dusk-ink/40">No contributions recorded yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dusk-ink/8 bg-dusk-ink/2">
                  <th className="px-5 py-3 text-left font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Member</th>
                  <th className="px-5 py-3 text-left font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Period</th>
                  <th className="px-5 py-3 text-right font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Note</th>
                  <th className="px-5 py-3 text-right font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dusk-ink/5">
                {detail.recentContributions.map((c) => (
                  <tr key={c.id} className="hover:bg-dusk-ink/2 transition-colors">
                    <td className="px-5 py-3 font-sans text-sm text-dusk-ink">{c.memberName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-dusk-ink/60">{c.period}</td>
                    <td className="px-5 py-3 text-right font-mono text-sm font-medium text-sage">R{c.amountPaid.toFixed(2)}</td>
                    <td className="px-5 py-3 font-sans text-xs text-dusk-ink/50">{c.note ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-dusk-ink/30">
                      {new Date(c.recordedAt).toLocaleDateString("en-ZA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
