"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArchMark } from "@/components/Logo";
import { isAuthenticated } from "@/lib/auth";
import { Text, Button } from "@/partials";

const features = [
  {
    title: "One vault for every policy",
    body: "Old Mutual, Capitec, church societies, burial clubs — every cover your family holds, in one calm place.",
  },
  {
    title: "Warned before it lapses",
    body: "Premium reminders with enough time to act. No more discovering a lapsed policy when you need it most.",
  },
  {
    title: "Claims, step by step",
    body: "A clear checklist for documents, contacts, and next actions when a claim has to be filed.",
  },
];

const steps = [
  { n: "01", title: "Add your policies", body: "Insurer, premium, due date, beneficiaries — takes a few minutes." },
  { n: "02", title: "Stay ahead of renewals", body: "See what’s current, due soon, overdue, or lapsed at a glance." },
  { n: "03", title: "Claim with clarity", body: "When the time comes, follow a guided path instead of guessing." },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.replace("/home");
  }, [router]);

  return (
    <main className="min-h-screen bg-dusk-ink text-warm-paper">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-atmosphere">
        <div className="pointer-events-none absolute inset-0 grain opacity-60" aria-hidden />
        <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-candlewick/10 blur-3xl animate-soft-pulse" aria-hidden />
        <div className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-sage/15 blur-3xl" aria-hidden />

        <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2.5 animate-fade-in">
            <ArchMark size={34} className="text-warm-paper" />
            <span className="font-serif text-xl font-semibold tracking">
              Funeral<span className="text-candlewick">Ease</span>
            </span>
          </div>
          <Link
            href="/login"
          >
            <Button variant="outline">
              Sign in
            </Button>
          </Link>
        </header>

        <div className="relative z-10 mx-auto grid max-w-5xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="text-center lg:text-left">
            <Text variant="heading_main" color="light" className="animate-fade-up mb-5">
              FuneralEase SA
            </Text>

            <Text color="light" className="animate-fade-up-delay">
              Never let a policy lapse without knowing.
            </Text>

            <Text color="light" className="animate-fade-up-delay-2">
              Track every funeral policy your family holds. Get reminded before
              premiums slip. Know exactly what to do when a claim needs filing.
            </Text>

            <div className="animate-fade-up-delay-3 mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/onboarding"
              >
                <Button variant="sec" className="w-full">
                  Get started — it&apos;s free
                </Button>
              </Link>

              <Link
                href="/login"
              >
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
            </div>

            <Text variant="body_small" superFaded color="light" className="mt-6 small_light_txt text_super_faded">
              POPIA-aware · Encrypted at rest · Built for South African families
            </Text>
          </div>

          {/* Product preview */}
          <div className="animate-fade-up-delay-2 relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="absolute -inset-4 rounded_bdr bg-gradient-to-br from-candlewick/20 via-transparent to-sage/20 blur-2xl" aria-hidden />
            <div className="relative animate-float rounded_bdr_inr border border-white/10 bg-warm-paper/95 p-5 shadow-2xl shadow-black/40 text-dusk-ink">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Text variant="heading_small" >This week</Text>
                  <Text variant="heading_sec" superFaded>Policy health</Text>
                </div>
                <span className="rounded_bdr_inr bg-ember/10 border border-ember/20 px-2.5 py-1 font-sans text-[11px] font-semibold text-ember">
                  2 need attention
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: "Old Mutual Funeral", meta: "Due 8 Aug · R185/mo", status: "Due soon", tone: "candlewick" },
                  { name: "Capitec Funeral Cover", meta: "Overdue · R99/mo", status: "Overdue", tone: "ember" },
                  { name: "Stokvel Burial Society", meta: "Paid · R50/mo", status: "Paid", tone: "sage" },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between rounded_bdr_inr border border-dusk-ink/8 bg-white px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <Text variant="body">{row.name}</Text>
                      <Text variant="body_small" superFaded>{row.meta}</Text>
                    </div>
                    <span
                      className={`ml-3 flex-shrink-0 rounded_bdr_inr px-2.5 py-0.5 font-sans text-[11px] font-semibold ${row.tone === "ember"
                        ? "bg-ember/10 text-ember"
                        : row.tone === "candlewick"
                          ? "bg-candlewick/15 text-candlewick"
                          : "bg-sage/10 text-sage"
                        }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded_bdr_inr bg-dusk-ink px-4 py-3 text-warm-paper">
                <Text variant="heading_sec" color="candle" className="mb-1">
                  Why it matters
                </Text>
                <Text variant="body" color="light" faded>
                  46% of life insurance complaints at the National Financial Ombud
                  are funeral benefit claims — often declined for lapsed premiums
                  or missing documents.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-warm-paper text-dusk-ink">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <Text variant="heading_sec" color="candle" className="mb-3">
            Built for the hard days
          </Text>
          <Text variant="heading_sub">
            Clarity for your family&apos;s cover — before you need it.
          </Text>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded_bdr border border-dusk-ink/8 bg-white p-6 transition hover:border-dusk-ink/15 hover:shadow-sm"
              >
                <div className="mb-4 h-1 w-10 rounded-full bg-candlewick" />
                <Text variant="heading_small">{f.title}</Text>
                <Text faded>{f.body}</Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-dusk-ink border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <Text variant="heading_sub" color="light" className="mb-3">
            How it works
          </Text>
          <Text variant="heading_sec" color="candle" className="mb-5" >
            Three steps. Less chaos later.
          </Text>

          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="relative">
                <Text variant="heading_small" color="candle" className="mb-3">{s.n}</Text>
                <Text variant="heading_sub" color="light">{s.title}</Text>
                <Text faded color="light">{s.body}</Text>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-warm-paper text-dusk-ink border-t border-dusk-ink/5">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <ArchMark size={40} className="text-dusk-ink mx-auto mb-6" />
          <Text variant="heading_sub" className="mx-auto mb-2">
            Start protecting your family&apos;s cover today.
          </Text>
          <Text className="mb-6" faded>
            Free to begin. Upgrade when your household needs more seats, societies, or advanced tools.
          </Text>
          <Link
            href="/onboarding"
          >
            <Button>
              Create your free account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-dusk-ink border-t border-white/5 px-6 py-8 text-center">
        <Text variant="body_small" color="light" superFaded>
          © {new Date().getFullYear()} FuneralEase · POPIA-aware · South Africa
        </Text>
      </footer>
    </main>
  );
}
