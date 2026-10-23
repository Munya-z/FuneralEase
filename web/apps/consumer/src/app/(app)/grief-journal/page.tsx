"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { griefJournal as journalApi, type GriefJournalEntryDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Text, Button } from "@/partials";


const MOODS = [
  { label: "Devastated", emoji: "💔" },
  { label: "Sad", emoji: "😢" },
  { label: "Numb", emoji: "😶" },
  { label: "Reflective", emoji: "🌿" },
  { label: "Grateful", emoji: "🙏" },
  { label: "Peaceful", emoji: "☁️" },
  { label: "Anxious", emoji: "😰" },
  { label: "Angry", emoji: "😤" },
  { label: "Other", emoji: "💭" },
];

function moodEmoji(mood: string) {
  return MOODS.find((m) => m.label === mood)?.emoji ?? "💭";
}

export default function GriefJournalPage() {
  const [entries, setEntries] = useState<GriefJournalEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    journalApi.list(token)
      .then((data) => setEntries([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditingId(null);
    setMood("");
    setContent("");
    setFormError("");
    setShowForm(true);
  }

  function openEdit(entry: GriefJournalEntryDto) {
    setEditingId(entry.id);
    setMood(entry.mood);
    setContent(entry.content);
    setFormError("");
    setShowForm(true);
    setExpandedId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        const updated = await journalApi.update(token, editingId, { content, mood });
        setEntries((prev) =>
          prev.map((en) => en.id === editingId ? updated : en)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } else {
        const created = await journalApi.create(token, { content, mood });
        setEntries((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingId(null);
      setMood("");
      setContent("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    try {
      await journalApi.delete(token, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (expandedId === id) setExpandedId(null);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full">
      <AppHeader title="Grief Journal" />

      <div className="px-6 py-6 space-y-4">
        {/* Intro */}
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light" >A private space to grieve</Text>
          <Text color="light" variant="body_small" faded >
            Writing about grief can help process loss. Your journal is private and only visible to you.
          </Text>
        </div>

        {/* New entry form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Text>{editingId ? "Edit entry" : "New entry"}</Text>
              <Button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Button>
            </div>

            <div className="space-y-2">
              <Text faded variant="body_small" >How are you feeling?</Text>
              <div className="grid grid-cols-3 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(m.label === mood ? "" : m.label)}
                    className={`flex flex-col items-center rounded-xl border py-2.5 gap-1 transition-colors ${mood === m.label
                      ? "bg-dusk-ink border-dusk-ink"
                      : "border-dusk-ink/15 hover:border-dusk-ink/30"
                      }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span className={`font-sans text-xs font-medium ${mood === m.label ? "text-warm-paper" : "text-dusk-ink/70"}`}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Write freely…</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today?"
                rows={6}
                required
                className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              />
            </div>

            {formError && <Text variant="body_small" className="text-ember">{formError}</Text>}

            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !mood || !content.trim()}
                className="flex-1">
                {saving ? "Saving…" : editingId ? "Update" : "Save entry"}
              </Button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-4">
              <span className="text-2xl">📔</span>
            </div>
            <Text variant="heading_small" className="mb-2">Your journal is empty</Text>
            <Text superFaded className="max-w-xs mb-6">
              Start writing to process your thoughts and emotions.
            </Text>
            <Button onClick={openNew}>
              Write first entry
            </Button>
          </div>
        )}

        {/* Entries list */}
        {!loading && entries.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const preview = entry.content.length > 100 ? entry.content.slice(0, 100) + "…" : entry.content;
          return (
            <div key={entry.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full flex items-start gap-3 px-4 py-4 text-left"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{moodEmoji(entry.mood)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-sans text-xs text-dusk-ink/50">
                      {new Date(entry.createdAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="font-sans text-xs font-medium text-dusk-ink/60 flex-shrink-0">{entry.mood}</span>
                  </div>
                  <Text faded >
                    {isExpanded ? entry.content : preview}
                  </Text>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 flex gap-2 border-t border-dusk-ink/6 pt-3">
                  <Button
                    onClick={() => openEdit(entry)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="delete"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="flex-1 "
                  >
                    {deletingId === entry.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating add button */}
      {!showForm && (
        <Button
          onClick={openNew}
          className="fixed bottom-20 right-4 w-14 h-14  shadow-lg flex items-center justify-center  transition-colors z-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Button>
      )}
    </div>
  );
}
