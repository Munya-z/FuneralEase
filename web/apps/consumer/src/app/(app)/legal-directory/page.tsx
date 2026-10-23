"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { legalDirectory as legalApi, type LegalPractitionerDto } from "@/lib/api";
import { Text, Button } from "@/partials";


const PROVINCES = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];
const PRACTICE_TYPES = ["Attorney", "Notary", "Conveyancer", "Estate Agent", "Financial Planner", "Accountant", "Social Worker", "Psychologist", "Other"];

function typeBadgeClass(type: string) {
  const map: Record<string, string> = {
    Attorney: "bg-dusk-ink/8 text-dusk-ink",
    Notary: "bg-candlewick/10 text-candlewick",
    Conveyancer: "bg-sage/10 text-sage",
  };
  return map[type] ?? "bg-dusk-ink/6 text-dusk-ink/60";
}

export default function LegalDirectoryPage() {
  const [results, setResults] = useState<LegalPractitionerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [practiceType, setPracticeType] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    legalApi.search()
      .then(setResults)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const data = await legalApi.search({
        area: search.trim() || undefined,
        province: province || undefined,
        practiceType: practiceType || undefined,
      });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="w-full">
      <AppHeader
        title="Legal Directory"
        action={
          <Link
            href="/legal-directory/submit"
            className="font-sans text-xs font-medium text-dusk-ink/60 hover:text-dusk-ink transition-colors"
          >
            Submit
          </Link>
        }
      />

      <div className="px-6 py-6 space-y-4">
        {/* Intro */}
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light" >Find legal & professional help</Text>
          <Text color="light" variant="body_small">
            Attorneys, estate agents, financial planners and more — vetted for the South African context.
          </Text>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by area or firm name…"
            className="w-full rounded-xl border border-dusk-ink/15 bg-white px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
          />

          <div className="flex gap-2">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="flex-1 rounded-xl border border-dusk-ink/15 bg-white px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
            >
              <option value="">All provinces</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={practiceType}
              onChange={(e) => setPracticeType(e.target.value)}
              className="flex-1 rounded-xl border border-dusk-ink/15 bg-white px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
            >
              <option value="">All types</option>
              {PRACTICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <Button
            type="submit"
            disabled={searching}
            className="w-full"
          >
            {searching ? "Searching…" : "Search"}
          </Button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Text superFaded className="mb-4">No listings found.</Text>
            <Link
              href="/legal-directory/submit"
              className="rounded-xl bg-dusk-ink px-5 py-2.5 font-sans text-xs font-semibold text-warm-paper"
            >
              Submit your practice
            </Link>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <Text variant="body_small" superFaded className="px-1">{results.length} listing{results.length !== 1 ? "s" : ""}</Text>
            {results.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Text className="truncate">{item.firmName}</Text>
                    <Text variant="body_small" className="mt-0.5">{item.contactName}</Text>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium flex-shrink-0 ${typeBadgeClass(item.practiceType)}`}>
                    {item.practiceType}
                  </span>
                </div>

                <Text variant="body_small" faded className="line-clamp-2">{item.description}</Text>

                <div className="space-y-1">
                  <Text variant="body_small" faded >
                    📍 {item.area}{item.province ? `, ${item.province}` : ""}
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${item.phoneNumber}`}
                      className="rounded-lg bg-dusk-ink/6 px-3 py-1.5 font-mono text-xs text-dusk-ink hover:bg-dusk-ink/10 transition-colors"
                    >
                      {item.phoneNumber}
                    </a>
                    <a
                      href={`mailto:${item.emailAddress}`}
                      className="rounded-lg bg-dusk-ink/6 px-3 py-1.5 font-sans text-xs text-dusk-ink hover:bg-dusk-ink/10 transition-colors"
                    >
                      Email
                    </a>
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-dusk-ink/6 px-3 py-1.5 font-sans text-xs text-dusk-ink hover:bg-dusk-ink/10 transition-colors"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/legal-directory/submit"
              className="block rounded-2xl border-2 border-dashed border-dusk-ink/15 py-4 text-center font-sans text-sm font-medium text-dusk-ink/50 hover:border-dusk-ink/30 hover:text-dusk-ink/70 transition-colors"
            >
              + Submit your practice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
