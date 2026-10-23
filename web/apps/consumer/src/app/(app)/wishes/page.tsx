"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { wishes as wishesApi, type WishesDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Text, Button, Input } from "@/partials";


const BURIAL_TYPES = ["Burial", "Cremation", "Green Burial", "Other"];
const CEREMONY_TYPES = ["Religious", "Secular", "Traditional", "Graveside", "Memorial", "No Service"];

export default function WishesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [burialType, setBurialType] = useState("");
  const [ceremonyType, setCeremonyType] = useState("");
  const [musicPreferences, setMusicPreferences] = useState("");
  const [readingPreferences, setReadingPreferences] = useState("");
  const [legacyMessage, setLegacyMessage] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [preferredParlourName, setPreferredParlourName] = useState("");
  const [donationsInLieuOf, setDonationsInLieuOf] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    wishesApi.get(token)
      .then((data: WishesDto) => {
        if (data) {
          setBurialType(data.burialType ?? "");
          setCeremonyType(data.ceremonyType ?? "");
          setMusicPreferences(data.musicPreferences ?? "");
          setReadingPreferences(data.readingPreferences ?? "");
          setLegacyMessage(data.legacyMessage ?? "");
          setSpecialRequests(data.specialRequests ?? "");
          setPreferredParlourName(data.preferredParlourName ?? "");
          setDonationsInLieuOf(data.donationsInLieuOf ?? "");
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await wishesApi.upsert(token, {
        burialType: burialType || undefined,
        ceremonyType: ceremonyType || undefined,
        musicPreferences: musicPreferences || undefined,
        readingPreferences: readingPreferences || undefined,
        legacyMessage: legacyMessage || undefined,
        specialRequests: specialRequests || undefined,
        preferredParlourName: preferredParlourName || undefined,
        donationsInLieuOf: donationsInLieuOf || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save wishes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <AppHeader title="My Wishes" />

      <div className="px-6 py-6 space-y-5">
        {/* Intro */}
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-2">
          <Text variant="heading_sub" color="light">Your voice, when it matters most</Text>
          <Text variant="body_small" color="light" faded>
            Recording your wishes now spares your family from making difficult decisions during an already painful time. These preferences will be securely stored and shared with your emergency contacts.
          </Text>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Burial type */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <Text variant="body_small" className="uppercase tracking-wider">Burial type</Text>
              <div className="grid grid-cols-2 gap-2">
                {BURIAL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBurialType(type === burialType ? "" : type)}
                    className={`rounded-xl border py-2.5 font-sans text-sm font-medium transition-colors ${burialType === type
                      ? "bg-dusk-ink border-dusk-ink text-warm-paper"
                      : "border-dusk-ink/15 text-dusk-ink/70 hover:border-dusk-ink/30"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Ceremony type */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <Text variant="body_small" className="uppercase tracking-wider">Ceremony type</Text>
              <div className="grid grid-cols-2 gap-2">
                {CEREMONY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCeremonyType(type === ceremonyType ? "" : type)}
                    className={`rounded-xl border py-2.5 font-sans text-sm font-medium transition-colors ${ceremonyType === type
                      ? "bg-dusk-ink border-dusk-ink text-warm-paper"
                      : "border-dusk-ink/15 text-dusk-ink/70 hover:border-dusk-ink/30"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Textareas */}
            {[
              { label: "Music preferences", value: musicPreferences, setter: setMusicPreferences, placeholder: "Songs, hymns, or artists you'd like played…", rows: 3 },
              { label: "Reading preferences", value: readingPreferences, setter: setReadingPreferences, placeholder: "Scriptures, poems, or passages to be read…", rows: 3 },
              { label: "Special requests", value: specialRequests, setter: setSpecialRequests, placeholder: "Dress code, flowers, attendees, other wishes…", rows: 3 },
            ].map(({ label, value, setter, placeholder, rows }) => (
              <div key={label} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
                <label className="font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">{label}</label>
                <textarea
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  rows={rows}
                  className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                />
              </div>
            ))}

            {/* Legacy message */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
              <label className="font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider">Your message to loved ones</label>
              <Text variant="body_small">This will be shared with your family after you pass.</Text>
              <textarea
                value={legacyMessage}
                onChange={(e) => setLegacyMessage(e.target.value)}
                placeholder="Write whatever is in your heart…"
                rows={5}
                className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              />
            </div>

            {/* Text inputs */}
            {[
              { label: "Preferred funeral parlour", value: preferredParlourName, setter: setPreferredParlourName, placeholder: "e.g. Doves Funeral Services, Johannesburg" },
              { label: "Donations in lieu of flowers", value: donationsInLieuOf, setter: setDonationsInLieuOf, placeholder: "Charity name or cause" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
                <Input
                  label={label}
                  variant="text"
                  type="text"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full"
                />
              </div>
            ))}

            {error && (
              <div className="rounded-2xl bg-ember/10 border border-ember/20 px-4 py-3">
                <Text className="text-ember">{error}</Text>
              </div>
            )}

            {saved && (
              <div className="rounded-2xl bg-sage/10 border border-sage/20 px-4 py-3">
                <Text className="text-sage">Wishes saved successfully.</Text>
              </div>
            )}

            <Button

              type="submit"
              disabled={saving}
              className="w-full disabled:opacity-50 "
            >
              {saving ? "Saving…" : "Save my wishes"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
