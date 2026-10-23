// @ts-ignore
import React from "react";

type BadgeVariant = "paid" | "due-soon" | "overdue" | "lapsed";

const variantClasses: Record<BadgeVariant, string> = {
  paid: "bg-sage/20 text-sage border-sage/30",
  "due-soon": "bg-candlewick/20 text-candlewick border-candlewick/30",
  overdue: "bg-ember/20 text-ember border-ember/30",
  lapsed: "bg-ember text-warm-paper border-ember",
};

const variantLabels: Record<BadgeVariant, string> = {
  paid: "Paid",
  "due-soon": "Due soon",
  overdue: "Overdue",
  lapsed: "Lapsed",
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

export function Badge({ variant, label }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
}
