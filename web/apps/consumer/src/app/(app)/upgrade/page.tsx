"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { getToken, getHouseholdId } from "@/lib/auth";
import { subscriptions as subscriptionsApi, type SubscriptionDto } from "@/lib/api";
import { Text, Button, Input } from "@/partials";


const TIERS = [
  {
    id: "Individual",
    name: "Individual",
    price: "R9/mo",
    color: "text-candlewick",
    bg: "bg-candlewick/10",
    ring: "ring-candlewick/30",
    features: [
      "Unlimited funeral policies",
      "WhatsApp + SMS premium reminders",
      "Up to 3 emergency contacts",
      "Claim management",
    ],
  },
  {
    id: "Family",
    name: "Family",
    price: "R29/mo",
    color: "text-sage",
    bg: "bg-sage/10",
    ring: "ring-sage/30",
    features: [
      "Everything in Individual",
      "Multiple household members",
      "Up to 5 emergency contacts",
      "Full audit trail",
      "Priority support",
    ],
  },
] as const;

export default function UpgradePage() {
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [selected, setSelected] = useState<"Individual" | "Family">("Individual");
  const [email, setEmail] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    const householdId = getHouseholdId();
    if (!token || !householdId) return;
    subscriptionsApi.get(token, householdId).then(setSubscription).catch(() => null);
  }, []);

  async function handleUpgrade() {
    const token = getToken();
    const householdId = getHouseholdId();
    if (!token || !householdId) return;
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setUpgrading(true);
    setError("");
    try {
      const callbackUrl = `${window.location.origin}/payment-complete`;
      const result = await subscriptionsApi.upgrade(token, householdId, selected, email.trim(), callbackUrl);
      // Redirect to Paystack checkout
      window.location.href = result.authorizationUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not initialise payment. Please try again.");
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div className="w-full">
      <AppHeader title="Upgrade Plan" />

      <div className="px-6 py-6 space-y-4">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text faded>Upgrade Plan</Text>
          <Text variant="body_small" faded >Choose a plan that fits your household and unlock premium features.</Text>
        </div>

        {TIERS.map((tier) => {
          const isActive = selected === tier.id;
          const isCurrent = subscription?.tier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              disabled={isCurrent}
              className={`w-full text-left rounded-2xl p-4 ring-1 transition-all ${isCurrent
                ? "bg-dusk-ink/4 ring-dusk-ink/10 opacity-60 cursor-not-allowed"
                : isActive
                  ? `${tier.bg} ${tier.ring}`
                  : "bg-white ring-black/5 hover:ring-dusk-ink/20"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Text variant="body_small" className={`${isActive ? tier.color : "text-dusk-ink"}`}>
                    {tier.name}
                    {isCurrent && <span className="ml-2 font-sans text-xs font-normal text-dusk-ink/40">(current)</span>}
                  </Text>
                  <Text variant="heading_sec" className={`${isActive ? tier.color : "text-dusk-ink"}`}>
                    {tier.price}
                  </Text>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${isActive ? `border-current ${tier.color}` : "border-dusk-ink/20"
                  }`}>
                  {isActive && <div className={`w-2.5 h-2.5 rounded-full ${tier.id === "Individual" ? "bg-candlewick" : "bg-sage"}`} />}
                </div>
              </div>
              <ul className="space-y-1.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`mt-0.5 shrink-0 ${isActive ? tier.color : "text-dusk-ink/30"}`}>
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-sans text-xs text-dusk-ink/70">{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}

        {/* Email for Paystack */}
        <div>
          <label className="block font-sans text-xs font-semibold text-dusk-ink/50 mb-1.5 uppercase tracking-wider">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-dusk-ink/15 bg-white px-4 py-3 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
          />
          <p className="mt-1 font-sans text-xs text-dusk-ink/40">Used for your Paystack payment receipt.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-ember/10 border border-ember/20 px-4 py-3 space-y-1">
            <Text className="font-sans text-sm text-ember">{error}</Text>
            {error.toLowerCase().includes("paystack") && (
              <Text variant="body_small" faded className="text-ember">
                Add your Paystack secret key to <span className="font-mono">api/.env</span> as{" "}
                <span className="font-mono">PAYSTACK_SECRET_KEY=sk_test_...</span>, then restart the API.
              </Text>
            )}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={upgrading || subscription?.tier === selected}
          className="w-full rounded-xl bg-dusk-ink py-3 font-sans text-sm font-semibold text-warm-paper disabled:opacity-40 transition"
        >
          {upgrading
            ? "Opening Paystack…"
            : `Pay via Paystack — ${TIERS.find(t => t.id === selected)?.price}`}
        </button>

        <div className="rounded-2xl bg-dusk-ink/5 ring-1 ring-dusk-ink/8 px-4 py-3">
          <Text variant="body_small" superFaded>
            Secure payment via Paystack. Your plan is activated automatically once payment is confirmed.
          </Text>
        </div>
      </div>
    </div>
  );
}
