"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { parlours as parloursApi, type ParlourDto } from "@/lib/api";
import { Text, Button, Input } from "@/partials";


const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

export default function ParloursPage() {
  const [results, setResults] = useState<ParlourDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [province, setProvince] = useState("");
  const [area, setArea] = useState("");
  const [searched, setSearched] = useState(false);

  function search() {
    setLoading(true);
    setSearched(true);
    parloursApi
      .search(area || undefined, province || undefined)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <AppHeader title="Funeral Parlours" />

      <div className="px-6 py-6 space-y-6">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light">Funeral Parlours</Text>
          <Text color="light" faded variant="body_small" >Find accredited funeral parlours near you across South Africa.</Text>
        </div>

        {/* Search filters */}
        <div className="rounded-2xl bg-white border border-dusk-ink/8 p-5">
          <Text as="h2" variant="body_small" faded className="uppercase tracking-wider mb-4">Search</Text>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">

              <Input
                label="Area / City"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="e.g. Soweto, Cape Town"
                className="w-full "
              />
            </div>
            <div className="lg:w-56">
              <label className="block font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider mb-1.5">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-4 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              >
                <option value="">All provinces</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="lg:self-end">
              <Button
                onClick={search}
                className="w-full transition-colors"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-dusk-ink/8 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && results.length === 0 && (
          <div className="rounded-2xl bg-white border border-dusk-ink/8 py-16 text-center">
            <Text superFaded >
              No parlours found. Try broadening your filters.
            </Text>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <Text superFaded variant="body_small" className="mb-3">
              {results.length} parlour{results.length !== 1 ? "s" : ""} found
            </Text>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl bg-white border border-dusk-ink/8 p-5 hover:border-dusk-ink/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <Text >{p.name}</Text>
                      <Text superFaded variant="body_small" className="mt-0.5">
                        {p.area}{p.province ? `, ${p.province}` : ""}
                      </Text>
                    </div>
                    {p.status === "Approved" && (
                      <Text as="span" variant="body_small" className="shrink-0 rounded-full bg-sage/10 border border-sage/20 px-2.5 py-0.5 text-sage">
                        Verified
                      </Text>
                    )}
                  </div>

                  {p.description && (
                    <Text variant="body_small" faded className="leading-relaxed mb-3">{p.description}</Text>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-dusk-ink/8">
                    <a
                      href={`tel:${p.phoneNumber}`}
                      className="flex-1 rounded-xl border border-dusk-ink/15 py-2 text-center font-sans text-xs font-semibold text-dusk-ink hover:bg-dusk-ink hover:text-warm-paper hover:border-dusk-ink transition-colors"
                    >
                      Call
                    </a>
                    <a
                      href={`mailto:${p.emailAddress}`}
                      className="flex-1 rounded-xl border border-dusk-ink/15 py-2 text-center font-sans text-xs font-semibold text-dusk-ink hover:bg-dusk-ink hover:text-warm-paper hover:border-dusk-ink transition-colors"
                    >
                      Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
