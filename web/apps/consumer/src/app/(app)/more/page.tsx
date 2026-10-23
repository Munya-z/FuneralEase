"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { clearTokens, getToken, getHouseholdId } from "@/lib/auth";
import { households as householdsApi, subscriptions as subscriptionsApi, type ReferralDto, type ReferralConversionDto, type SubscriptionDto } from "@/lib/api";
import { Text, Button, Input } from "@/partials";


const tierDetails = {
  Free: { label: "Free", color: "text-dusk-ink/60", bg: "bg-dusk-ink/6", limit: "1 policy · in-app reminders only" },
  Individual: { label: "Individual", color: "text-candlewick", bg: "bg-candlewick/10", limit: "Unlimited policies · WhatsApp + SMS reminders" },
  Family: { label: "Family", color: "text-sage", bg: "bg-sage/10", limit: "Multiple members · Emergency Access · Audit trail" },
  BurialSociety: { label: "Burial Society", color: "text-dusk-ink", bg: "bg-dusk-ink/8", limit: "Group workspace · Contribution ledger · Voting" },
};

export default function MorePage() {
  const router = useRouter();
  const [referral, setReferral] = useState<ReferralDto | null>(null);
  const [conversions, setConversions] = useState<ReferralConversionDto[] | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [joiningReferral, setJoiningReferral] = useState(false);
  const [joinReferralError, setJoinReferralError] = useState("");
  const [joinReferralSuccess, setJoinReferralSuccess] = useState(false);

  useEffect(() => {
    const token = getToken();
    const householdId = getHouseholdId();
    if (!token || !householdId) return;
    Promise.all([
      householdsApi.getReferral(token, householdId).catch(() => null),
      householdsApi.getReferralConversions(token, householdId).catch(() => null),
      subscriptionsApi.get(token, householdId).catch(() => null),
    ]).then(([ref, conv, sub]) => {
      setReferral(ref);
      setConversions(conv);
      setSubscription(sub);
    });
  }, []);

  function signOut() {
    clearTokens();
    router.push("/");
  }

  function copyReferralLink() {
    if (!referral) return;
    navigator.clipboard.writeText(referral.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareReferral() {
    if (!referral) return;
    if (navigator.share) {
      navigator.share({
        title: "Join me on FuneralEase",
        text: "Track your funeral policies and protect your family. Join using my referral link:",
        url: referral.referralLink,
      }).catch(() => null);
    } else {
      copyReferralLink();
    }
  }

  async function downloadData() {
    const token = getToken();
    const householdId = getHouseholdId();
    if (!token || !householdId) return;
    setExporting(true);
    try {
      const data = await householdsApi.exportData(token, householdId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "funeralease-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function joinWithReferral(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !referralCode.trim()) return;
    setJoiningReferral(true);
    setJoinReferralError("");
    try {
      await householdsApi.joinWithReferral(token, referralCode.trim().toUpperCase());
      setJoinReferralSuccess(true);
      setReferralCode("");
    } catch (err) {
      setJoinReferralError(err instanceof Error ? err.message : "Invalid referral code");
    } finally {
      setJoiningReferral(false);
    }
  }

  return (
    <div className="w-full">
      <AppHeader title="More" />

      <div className="px-6 py-6 space-y-6">
        {/* Subscription card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <Text variant="body_small" superFaded className="uppercase tracking-wider">
              Your plan
            </Text>
            {subscription ? (
              <Text as="span" className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${tierDetails[subscription.tier as keyof typeof tierDetails]?.bg ?? tierDetails.Free.bg} ${tierDetails[subscription.tier as keyof typeof tierDetails]?.color ?? tierDetails.Free.color}`}>
                {tierDetails[subscription.tier as keyof typeof tierDetails]?.label ?? subscription.tier}
              </Text>
            ) : (
              <span className="h-4 w-16 rounded bg-dusk-ink/8 animate-pulse inline-block" />
            )}
          </div>

          {subscription?.isInTrial && subscription.trialEndsAt && (
            <div className="mb-3 rounded-xl bg-candlewick/10 border border-candlewick/20 px-3 py-2">
              <Text color="candle" variant="body_small" >
                Free trial — ends {new Date(subscription.trialEndsAt).toLocaleDateString("en-ZA")}
              </Text>
            </div>
          )}

          <Text faded variant="body_small">
            {subscription ? tierDetails[subscription.tier as keyof typeof tierDetails]?.limit ?? "" : ""}
          </Text>

          {(!subscription || subscription.tier === "Free") && (
            <div className="space-y-2">
              {(["Individual", "Family"] as const).map((tier) => {
                const t = tierDetails[tier];
                return (
                  <div key={tier} className={`rounded-xl ${t.bg} px-3 py-2.5 flex items-center justify-between`}>
                    <div>
                      <Text variant="body_small" className={` ${t.color}`}>{t.label}</Text>
                      <Text variant="body_small" superFaded >{t.limit}</Text>
                    </div>
                    <Text variant="body_sec" className={`${t.color}`}>
                      {tier === "Individual" ? "R9/mo" : "R29/mo"}
                    </Text>
                  </div>
                );
              })}
            </div>
          )}

          {(!subscription || subscription.tier === "Free") && (
            <Link href="/upgrade" className="mt-3 block w-full rounded-xl bg-dusk-ink py-2.5 text-center font-sans text-xs font-semibold text-warm-paper">
              Upgrade plan
            </Link>
          )}
        </div>

        {/* Referral share card */}
        {referral && (
          <div className="rounded-2xl bg-dusk-ink p-4 space-y-3">
            <div>
              <Text variant="body_small_sec" color="light" superFaded className="uppercase tracking-widest mb-0.5">
                Refer a family
              </Text>
              <Text variant="heading_small" color="light">
                Your code: <Text as="span" variant="heading_sec">{referral.referralCode}</Text>
              </Text>
              {referral.conversionsCount > 0 && (
                <Text variant="body_small" color="light" faded className="mt-0.5">
                  {referral.conversionsCount} household{referral.conversionsCount !== 1 ? "s" : ""} joined via your link
                </Text>
              )}
            </div>
            <Text faded color="light" variant="body_small" >
              Help another family protect themselves. Share your referral link.
            </Text>
            <div className="flex gap-2">
              <Button
                onClick={shareReferral}
              >
                Share link
              </Button>
              <Button
                variant="sec"
                onClick={copyReferralLink}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}

        {/* Referral conversions list */}
        {conversions && conversions.length > 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
            <Text variant="body_small" faded className="uppercase tracking-wider mb-3">
              Families who joined via your link
            </Text>
            <div className="space-y-2">
              {conversions.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-dusk-ink/6 last:border-0">
                  <Text >{c.householdName}</Text>
                  <Text superFaded variant="body_small" >
                    {new Date(c.joinedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join with referral code */}
        {!joinReferralSuccess ? (
          <form onSubmit={joinWithReferral} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <Text variant="body_small" faded className="uppercase tracking-wider">
              Have a referral code?
            </Text>
            <div className="flex gap-2">
              <Input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC12345"
                maxLength={10}
                className="flex-1 "
              />
              <Button
                type="submit"
                disabled={joiningReferral || !referralCode.trim()}
              >
                {joiningReferral ? "…" : "Join"}
              </Button>
            </div>
            {joinReferralError && (
              <Text variant="body_small" className="text-ember">{joinReferralError}</Text>
            )}
          </form>
        ) : (
          <div className="rounded-2xl bg-sage/10 ring-1 ring-sage/20 p-4">
            <Text className="text-sage">Referral applied!</Text>
            <Text variant="body_small" faded className="mt-0.5">You've been linked to the referring household.</Text>
          </div>
        )}

        {/* Textlanning section */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <Text faded variant="body_small" className="uppercase tracking-wider">
            Planning
          </Text>
          {[
            { label: "My funeral wishes", icon: "🕊️", href: "/wishes" },
            { label: "Digital vault", icon: "🔐", href: "/digital-vault" },
            { label: "Estate checklist", icon: "✅", href: "/estate-checklist" },
            { label: "Obituary", icon: "📜", href: "/obituary" },
          ].map((item, i, arr) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-dusk-ink/4 ${i < arr.length - 1 ? "border-b border-dusk-ink/6" : ""}`}
            >
              <Text as="span" className="text-base">{item.icon}</Text>
              <Text as="span" className="flex-1 font-sans text-sm text-dusk-ink">{item.label}</Text>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/25">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Tools section */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <Text variant="body_small" faded className="uppercase tracking-wider">
            Tools
          </Text>
          {[
            { label: "Coverage analysis", icon: "📊", href: "/coverage" },
            { label: "Grief journal", icon: "📔", href: "/grief-journal" },
            { label: "Fundraising", icon: "🤝", href: "/fundraiser" },
            { label: "Legal directory", icon: "⚖️", href: "/legal-directory" },
          ].map((item, i, arr) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-dusk-ink/4 ${i < arr.length - 1 ? "border-b border-dusk-ink/6" : ""}`}
            >
              <Text as="span" className="text-base">{item.icon}</Text>
              <Text as="span" className="flex-1" > {item.label}</Text>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/25">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Settings sections */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          {[
            { label: "Notification preferences", icon: "🔔", href: "/notifications" },
            { label: "Emergency access settings", icon: "🔑", href: "/family" },
            { label: "Burial society", icon: "🤝", href: "/burial-society" },
            { label: "Parlour directory", icon: "📍", href: "/parlours" },
            { label: "Resources & guides", icon: "📖", href: "/resources" },
          ].map((item, i, arr) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-dusk-ink/4 ${i < arr.length - 1 ? "border-b border-dusk-ink/6" : ""}`}
            >
              <Text as="span" className="text-base">{item.icon}</Text>
              <Text as="span" className="flex-1">{item.label}</Text>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/25">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        {/* POPIA / data section */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <Text variant="body_small" faded className="uppercase tracking-wider">
            Privacy & data
          </Text>
          <Button
            variant="sec"
            onClick={downloadData}
            disabled={exporting}
            className="w-full "
          >
            <span className="text-base">⬇️</span>
            <Text as="span" className="flex-1 ">
              {exporting ? "Preparing export…" : "Download my data (POPIA)"}
            </Text>
          </Button>
          <Link
            href="/delete-account"
            className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-dusk-ink/4"
          >
            <span className="text-base">🗑️</span>
            <Text as="span" className="flex-1 text-ember">Delete my account</Text>
          </Link>
        </div>

        {/* Sign out */}
        <Button
          onClick={signOut}
        // className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-black/5 px-4 py-3.5 text-left font-sans text-sm text-dusk-ink/60 hover:text-dusk-ink transition-colors flex items-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/40">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </Button>

        <Text superFaded variant="body_small" className="text-center pb-2">
          FuneralEase SA · POPIA-compliant · v1.0
        </Text>
      </div >
    </div >
  );
}
