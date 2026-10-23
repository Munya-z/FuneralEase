// @ts-ignore
import React from "react";
import { Badge } from "./Badge";

type PolicyStatus = "paid" | "due-soon" | "overdue" | "lapsed";

interface PolicyCardProps {
  insurerName: string;
  policyNumber: string;
  coverAmount: number;
  premiumAmount: number;
  nextDueDate: string;
  membersCount: number;
  status: PolicyStatus;
  onClick?: () => void;
}

export function PolicyCard({
  insurerName,
  policyNumber,
  coverAmount,
  premiumAmount,
  nextDueDate,
  membersCount,
  status,
  onClick,
}: PolicyCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-dusk-ink">
            {insurerName}
          </p>
          <p className="font-mono text-xs text-dusk-ink/50 mt-0.5">
            {policyNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-medium text-dusk-ink">
            R{premiumAmount.toLocaleString()}/mo
          </p>
          <p className="font-mono text-xs text-dusk-ink/50">
            Due {nextDueDate}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="font-sans text-xs text-dusk-ink/60">
          Covers {membersCount} {membersCount === 1 ? "member" : "members"} ·{" "}
          R{coverAmount.toLocaleString()} cover
        </p>
        <Badge variant={status} />
      </div>
    </button>
  );
}
