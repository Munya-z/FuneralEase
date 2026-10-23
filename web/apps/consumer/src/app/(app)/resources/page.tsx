"use client";

import { useState } from "react";
import Link from "next/link";
import { Text, Button, Input } from "@/partials";


const REPATRIATION_STEPS = [
  { heading: "Notify the SA Embassy", body: "Contact the nearest SA embassy or consulate in the country where the deceased passed away." },
  { heading: "Obtain a Death Certificate", body: "Secure a local death certificate from authorities in the country of death. Get it apostilled or authenticated." },
  { heading: "Engage a Licensed Repatriation Service", body: "Use a funeral parlour that offers international repatriation or contact the SA Funeral Practitioners Association." },
  { heading: "Prepare the Deceased for Travel", body: "The deceased must be embalmed and placed in a zinc-lined wooden coffin sealed to international standards." },
  { heading: "Obtain Travel Documents", body: "Secure a permit to export human remains, a laissez-passer, and notify DIRCO." },
  { heading: "Arrange Airfreight or Sea Freight", body: "Coordinate with the airline cargo department. SA Airways and other carriers have specific requirements." },
  { heading: "Clear with Home Affairs on Arrival", body: "Present all documentation at the South African port of entry. Customs clearance is required." },
];

const GRIEF_RESOURCES = [
  { name: "SADAG", description: "24-hour grief counselling and trauma support.", phone: "0800 567 567", whatsapp: "076 882 2775" },
  { name: "Lifeline SA", description: "Confidential counselling and crisis support. Free to call.", phone: "0861 322 322", whatsapp: null },
  { name: "FAMSA", description: "Family counselling and bereavement support across major cities.", phone: "011 788 4784", whatsapp: null },
  { name: "Child Welfare SA", description: "Supports children who have lost a parent or caregiver.", phone: "0800 435 754", whatsapp: null },
];

type Tab = "grief" | "repatriation";

export default function ResourcesPage() {
  const [tab, setTab] = useState<Tab>("grief");

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-dusk-ink/8 px-6 py-5">
        <Text variant="body_small_sec" superFaded className="uppercase mb-0.5">
          Support
        </Text>
        <Text as="h1" variant="heading_sub">Resources</Text>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-dusk-ink/10 bg-white sticky top-0 z-10">
        {(["grief", "repatriation"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${tab === t
              ? "text-dusk-ink border-b-2 border-dusk-ink"
              : "text-dusk-ink/40"
              }`}
          >
            {t === "grief" ? "Grief support" : "Repatriation"}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 space-y-6">
        {tab === "grief" && (
          <>
            <div className="rounded-2xl bg-sage/8 ring-1 ring-sage/20 p-4">
              <Text variant="body_small" faded >
                Grief is not a problem to be solved. These organisations offer free or subsidised support to South Africans navigating loss.
              </Text>
            </div>

            {GRIEF_RESOURCES.map((r) => (
              <div key={r.name} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
                <Text className="font-sans text-sm font-semibold text-dusk-ink">{r.name}</Text>
                <Text faded variant="body_small" >{r.description}</Text>
                <div className="flex gap-2">
                  <a
                    href={`tel:${r.phone}`}
                    className="flex-1 rounded-xl border border-dusk-ink/15 py-2 text-center font-sans text-xs font-medium text-dusk-ink"
                  >
                    {r.phone}
                  </a>
                  {r.whatsapp && (
                    <a
                      href={`https://wa.me/27${r.whatsapp.replace(/\D/g, "").slice(1)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl border border-sage/30 bg-sage/8 py-2 text-center font-sans text-xs font-medium text-sage"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
              <Text variant="body_small" superFaded className=" uppercase tracking-wider mb-2">
                Self-care reminders
              </Text>
              <ul className="space-y-2">
                {[
                  "Allow yourself to feel grief — there is no right way to mourn.",
                  "Lean on trusted family and community (ubuntu).",
                  "Maintain basic routines: eating, sleeping, gentle exercise.",
                  "Limit major decisions in the first few months after loss.",
                  "Seek professional help if grief significantly impairs daily life for more than 6 weeks.",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2 font-sans text-xs text-dusk-ink/70 leading-relaxed">
                    <span className="mt-0.5 shrink-0 h-4 w-4 rounded-full bg-sage/20 flex items-center justify-center font-mono text-[10px] text-sage font-bold">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {tab === "repatriation" && (
          <>
            <div className="rounded-2xl bg-candlewick/8 ring-1 ring-candlewick/20 p-4">
              <Text faded >
                Bringing a loved one home from abroad involves multiple authorities. Follow these steps to navigate the process.
              </Text>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
              {REPATRIATION_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`p-4 flex gap-3 ${i < REPATRIATION_STEPS.length - 1 ? "border-b border-dusk-ink/6" : ""}`}
                >
                  <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-dusk-ink flex items-center justify-center font-mono text-[10px] text-warm-paper font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <Text className="mb-0.5">
                      {step.heading}
                    </Text>
                    <Text variant="body_small" faded>{step.body}</Text>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-dusk-ink/5 ring-1 ring-dusk-ink/10 p-4">
              <Text variant="body_small" className="mb-1">Need help?</Text>
              <Text variant="body_small" faded className=" mb-3">
                Verified funeral parlours in our directory can assist with international repatriation.
              </Text>
              <Link
                href="/parlours"
                className="block text-center rounded-xl bg-dusk-ink py-2 font-sans text-xs font-semibold text-warm-paper"
              >
                Find a parlour
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
