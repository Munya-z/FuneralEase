"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { obituary as obituaryApi, type ObituaryDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Text, Button } from "@/partials";


const TONES = ["Formal", "Warm", "Religious", "Traditional"];

type Tab = "generate" | "edit";

export default function ObituaryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [saved, setSaved] = useState<ObituaryDto | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Generate form
  const [deceasedFullName, setDeceasedFullName] = useState("");
  const [ageAtDeath, setAgeAtDeath] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [occupation, setOccupation] = useState("");
  const [hometown, setHometown] = useState("");
  const [survivedBy, setSurvivedBy] = useState("");
  const [lifeHighlights, setLifeHighlights] = useState("");
  const [tone, setTone] = useState("Warm");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [generateError, setGenerateError] = useState("");

  // Edit tab
  const [editContent, setEditContent] = useState("");
  const [editName, setEditName] = useState("");
  const [savingObituary, setSavingObituary] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoadingSaved(false); return; }
    obituaryApi.get(token)
      .then((data) => {
        setSaved(data);
        if (data) {
          setEditContent(data.content);
          setEditName(data.deceasedFullName);
        }
      })
      .catch(() => null)
      .finally(() => setLoadingSaved(false));
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setGenerating(true);
    setGenerateError("");
    setGenerated("");
    try {
      const result = await obituaryApi.generate(token, {
        deceasedFullName,
        ageAtDeath: ageAtDeath ? Number(ageAtDeath) : undefined,
        dateOfBirth: dateOfBirth || undefined,
        dateOfDeath: dateOfDeath || undefined,
        occupation: occupation || undefined,
        hometown: hometown || undefined,
        survivedBy: survivedBy || undefined,
        lifeHighlights: lifeHighlights || undefined,
        tonePreference: tone,
      });
      setGenerated(result.content);
      setSaved(result);
      setEditContent(result.content);
      setEditName(result.deceasedFullName);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate obituary");
    } finally {
      setGenerating(false);
    }
  }

  async function saveGenerated() {
    const token = getToken();
    if (!token || !generated) return;
    setSavingObituary(true);
    setSaveError("");
    try {
      const result = await obituaryApi.save(token, { deceasedFullName, content: generated });
      setSaved(result);
      setEditContent(result.content);
      setEditName(result.deceasedFullName);
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); setActiveTab("edit"); }, 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingObituary(false);
    }
  }

  async function saveEdited() {
    const token = getToken();
    if (!token) return;
    setSavingObituary(true);
    setSaveError("");
    try {
      const result = await obituaryApi.save(token, { deceasedFullName: editName, content: editContent });
      setSaved(result);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingObituary(false);
    }
  }

  function handleShare() {
    if (!saved) return;
    if (navigator.share) {
      navigator.share({ title: `Obituary — ${saved.deceasedFullName}`, text: saved.content }).catch(() => null);
    } else {
      navigator.clipboard.writeText(saved.content).catch(() => null);
    }
  }

  return (
    <div className="w-full">
      <AppHeader title="Obituary" />

      <div className="px-6 py-6 space-y-4">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light" >Obituary</Text>
          <Text faded color="light" variant="body_small" >Generate a meaningful obituary with AI, then edit and save it for sharing or printing.</Text>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-dusk-ink/6 p-1 gap-1">
          {(["generate", "edit"] as const).map((tab) => (
            <Button
              variant="sec"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 capitalize ${activeTab === tab ? "bg-white text-dusk-ink shadow-sm" : "text-dusk-ink/50"
                }`}
            >
              {tab === "generate" ? "Generate" : "Edit & Save"}
            </Button>
          ))}
        </div>

        {/* Generate tab */}
        {activeTab === "generate" && (
          <div className="space-y-4">
            <form onSubmit={handleGenerate} className="space-y-3">
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
                <Text variant="body_small" superFaded className="uppercase tracking-wider">About the deceased</Text>

                {[
                  { label: "Full name", value: deceasedFullName, setter: setDeceasedFullName, placeholder: "e.g. Nomvula Dlamini", required: true, type: "text" },
                  { label: "Age at death", value: ageAtDeath, setter: setAgeAtDeath, placeholder: "e.g. 72", required: false, type: "number" },
                  { label: "Date of birth", value: dateOfBirth, setter: setDateOfBirth, placeholder: "", required: false, type: "date" },
                  { label: "Date of death", value: dateOfDeath, setter: setDateOfDeath, placeholder: "", required: false, type: "date" },
                  { label: "Occupation", value: occupation, setter: setOccupation, placeholder: "e.g. Teacher, nurse, farmer", required: false, type: "text" },
                  { label: "Hometown", value: hometown, setter: setHometown, placeholder: "e.g. Soweto, Johannesburg", required: false, type: "text" },
                ].map(({ label, value, setter, placeholder, required, type }) => (
                  <div key={label} className="space-y-1">
                    <label className="font-sans text-xs font-medium text-dusk-ink/60">
                      {label}{!required && <span className="text-dusk-ink/30"> (optional)</span>}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      required={required}
                      className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Survived by <span className="text-dusk-ink/30">(optional)</span></label>
                  <textarea
                    value={survivedBy}
                    onChange={(e) => setSurvivedBy(e.target.value)}
                    placeholder="e.g. her husband Thabo, three children, five grandchildren…"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Life highlights <span className="text-dusk-ink/30">(optional)</span></label>
                  <textarea
                    value={lifeHighlights}
                    onChange={(e) => setLifeHighlights(e.target.value)}
                    placeholder="Key moments, achievements, passions, community roles…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>
              </div>

              {/* Tone selector */}
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
                <Text variant="body_small" superFaded className="uppercase tracking-wider">Tone</Text>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`rounded-xl border py-2.5 font-sans text-sm font-medium transition-colors ${tone === t ? "bg-dusk-ink border-dusk-ink text-warm-paper" : "border-dusk-ink/15 text-dusk-ink/70 hover:border-dusk-ink/30"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {generateError && (
                <div className="rounded-2xl bg-ember/10 border border-ember/20 px-4 py-3">
                  <Text className="text-ember">{generateError}</Text>
                </div>
              )}

              <Button
                type="submit"
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-warm-paper/30 border-t-warm-paper animate-spin" />
                    Generating…
                  </span>
                ) : "Generate with AI"}
              </Button>
            </form>

            {/* Generated result */}
            {generated && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-4">
                <Text variant="body_small" superFaded className="uppercase tracking-wider">Generated obituary</Text>
                <div className="rounded-xl bg-warm-paper border border-dusk-ink/10 px-4 py-4">
                  <Text className="whitespace-pre-line">{generated}</Text>
                </div>

                {saveSuccess && (
                  <div className="rounded-xl bg-sage/10 border border-sage/20 px-3 py-2">
                    <Text variant="body_small" className="text-sage">Obituary saved!</Text>
                  </div>
                )}

                {saveError && <Text variant="body_small" className="text-ember">{saveError}</Text>}

                <Button
                  onClick={saveGenerated}
                  disabled={savingObituary}
                  className="w-full"
                >
                  {savingObituary ? "Saving…" : "Save obituary"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Edit tab */}
        {activeTab === "edit" && (
          <div className="space-y-4">
            {loadingSaved && (
              <div className="h-40 rounded-2xl bg-dusk-ink/6 animate-pulse" />
            )}

            {!loadingSaved && !saved && (
              <div className="flex flex-col items-center py-12 text-center">
                <Text superFaded className=" mb-2">No saved obituary yet.</Text>
                <Button variant="sec" onClick={() => setActiveTab("generate")} className="underline">
                  Generate one first
                </Button>
              </div>
            )}

            {!loadingSaved && saved && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Name of the deceased</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-dusk-ink/15 bg-white px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-medium text-dusk-ink/60">Obituary text</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={12}
                    className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-white px-3 py-2.5 font-serif text-sm text-dusk-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>

                <Text variant="body_small" superFaded>
                  Last updated {new Date(saved.generatedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                </Text>

                {saveSuccess && (
                  <div className="rounded-xl bg-sage/10 border border-sage/20 px-3 py-2">
                    <Text variant="body_small" className="text-sage">Saved!</Text>
                  </div>
                )}

                {saveError && <Text variant="body_small" className="text-ember">{saveError}</Text>}

                <div className="flex gap-2">
                  <Button
                    onClick={saveEdited}
                    disabled={savingObituary}
                    className="flex-1"
                  >
                    {savingObituary ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
