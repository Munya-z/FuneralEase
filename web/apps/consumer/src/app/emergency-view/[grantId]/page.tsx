"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Text, Button, Input } from "@/partials";


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface GrantViewPolicyDto {
  insurerName: string;
  policyNumber: string;
  premiumAmount: number;
  nextDueDate: string;
  lapseStatus: string;
  beneficiaryNames: string[];
}

interface GrantViewDto {
  grantId: string;
  householdName: string;
  expiresAt: string;
  policies: GrantViewPolicyDto[];
}

const statusMap: Record<string, { label: string; className: string }> = {
  Current: { label: "Paid", className: "text-sage bg-sage/10" },
  DueSoon: { label: "Due soon", className: "text-candlewick bg-candlewick/10" },
  Overdue: { label: "Overdue", className: "text-ember bg-ember/10" },
  Lapsed: { label: "Lapsed", className: "text-white bg-ember" },
};

export default function EmergencyViewPage() {
  const { grantId } = useParams<{ grantId: string }>();
  const [data, setData] = useState<GrantViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!grantId) return;
    fetch(`${API_URL}/emergency-access/view/${grantId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.title ?? "This access link is not valid or has expired.");
        }
        return res.json() as Promise<GrantViewDto>;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [grantId]);

  return (
    <div className="min-h-screen bg-warm-paper">
      {/* Header */}
      <div className="bg-dusk-ink px-5 pt-10 pb-6">
        <Text variant="heading_sec" className="tracking-widest mb-1">
          Emergency access
        </Text>
        <Text as="h1" color="light" variant="heading_sub">
          {loading ? "Loading…" : data ? `${data.householdName}'s policies` : "Access unavailable"}
        </Text>
        {data && (
          <Text variant="body_small" faded className="mt-1">
            Access expires {new Date(data.expiresAt).toLocaleString("en-ZA")}
          </Text>
        )}
      </div>

      <div className="max-w-sm mx-auto px-4 py-4 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-dusk-ink/6 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-ember/10 border border-ember/20 px-5 py-6 text-center space-y-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-ember mx-auto">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Text variant="body" className="text-ember">Access denied</Text>
            <Text variant="body_small" faded >{error}</Text>
          </div>
        )}

        {!loading && data && data.policies.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-5 py-8 text-center">
            <Text faded>No policies found for this household.</Text>
          </div>
        )}

        {!loading && data && data.policies.map((policy, i) => {
          const s = statusMap[policy.lapseStatus] ?? statusMap.Current;
          return (
            <div key={i} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Text variant="body" >{policy.insurerName}</Text>
                  <Text variant="heading_sec" className=" mt-0.5">{policy.policyNumber}</Text>
                </div>
                <div className="text-right">
                  <Text variant="body_sec">
                    R{policy.premiumAmount.toLocaleString()}/mo
                  </Text>
                  <Text variant="heading_sec" faded>Due {policy.nextDueDate}</Text>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Text className="small_dark_txt text_faded">
                  {policy.beneficiaryNames.length > 0
                    ? policy.beneficiaryNames.join(", ")
                    : "No beneficiaries set"}
                </Text>
                <Text as="span" className={`rounded_bdr_inr px-2.5 py-0.5 font-sans text-xs font-medium ${s.className}`}>
                  {s.label}
                </Text>
              </div>
            </div>
          );
        })}

        {!loading && data && (
          <div className="rounded_bdr bg-dusk-ink/5 ring-1 ring-dusk-ink/8 px-4 py-3">
            <Text faded variant="body_small">
              This is a read-only emergency view. You cannot make changes to any policies here. Contact the household directly for any actions.
            </Text>
          </div>
        )}

        <div className="text-center pt-2 pb-4">
          <Text variant="body_small" superFaded>FuneralEase SA · Emergency Access</Text>
        </div>
      </div>
    </div>
  );
}
