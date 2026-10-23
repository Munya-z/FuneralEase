"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { digitalVault as vaultApi, type DigitalVaultItemDto } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Input, Text, Button } from "@/partials";

const CATEGORIES = ["Password", "Banking Account", "Social Media", "Email Account", "Subscription", "Investment", "Crypto Wallet", "Other"];
const ON_DEATH_OPTIONS = ["Delete Account", "Memorialize", "Transfer to Family", "Do Nothing"];

function maskUsername(username?: string) {
  if (!username) return "";
  if (username.length <= 4) return "••••";
  return username.slice(0, 2) + "••••" + username.slice(-2);
}

type FormState = {
  category: string;
  serviceName: string;
  username: string;
  notes: string;
  url: string;
  onDeathInstruction: string;
};

const EMPTY_FORM: FormState = { category: "", serviceName: "", username: "", notes: "", url: "", onDeathInstruction: "" };

export default function DigitalVaultPage() {
  const [items, setItems] = useState<DigitalVaultItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    vaultApi.list(token)
      .then(setItems)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(item: DigitalVaultItemDto) {
    setEditingId(item.id);
    setForm({
      category: item.category,
      serviceName: item.serviceName,
      username: item.username ?? "",
      notes: item.notes ?? "",
      url: item.url ?? "",
      onDeathInstruction: item.onDeathInstruction,
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        category: form.category,
        serviceName: form.serviceName,
        username: form.username || undefined,
        notes: form.notes || undefined,
        url: form.url || undefined,
        onDeathInstruction: form.onDeathInstruction,
      };
      if (editingId) {
        const updated = await vaultApi.update(token, editingId, payload);
        setItems((prev) => prev.map((i) => i.id === editingId ? updated : i));
      } else {
        const created = await vaultApi.create(token, payload);
        setItems((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    try {
      await vaultApi.delete(token, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // Group by category
  const grouped = CATEGORIES.reduce<Record<string, DigitalVaultItemDto[]>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});
  const otherItems = items.filter((i) => !CATEGORIES.includes(i.category));
  if (otherItems.length > 0) grouped["Other"] = [...(grouped["Other"] ?? []), ...otherItems];

  return (
    <div className="w-full">
      <AppHeader
        title="Digital Vault"
        action={
          <Button
            onClick={openAdd}
            className="flex items-center gap-2 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add item
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-4">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light" >Digital Vault</Text>
          <Text variant="body_small" faded color="light" >Securely store passwords, accounts, and digital assets so your family can manage them when the time comes.</Text>
        </div>

        {/* Security note */}
        <div className="rounded-2xl bg-sage/8 border border-sage/20 px-4 py-3 flex items-start gap-3">
          <span className="text-base mt-0.5 flex-shrink-0">🔒</span>
          <Text variant="body_small" >
            Stored securely and only accessible to your emergency contacts.
          </Text>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Text >{editingId ? "Edit item" : "Add digital asset"}</Text>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-dusk-ink/40 hover:text-dusk-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">

              <Input
                label="Service name"
                type="text"
                value={form.serviceName}
                onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                placeholder="e.g. Gmail, FNB Online Banking"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-1">

              <Input
                label="Username / email {optional}"
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="e.g. thabo@gmail.com"
                className="w-full"
              />
            </div>

            <div className="space-y-1">

              <Input
                label="URL {optional}"
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://…"
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional information…"
                rows={2}
                className="w-full resize-none rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">On death instruction</label>
              <select
                value={form.onDeathInstruction}
                onChange={(e) => setForm((f) => ({ ...f, onDeathInstruction: e.target.value }))}
                required
                className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
              >
                <option value="">What should happen?</option>
                {ON_DEATH_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {error && <p className="font-sans text-xs text-ember">{error}</p>}

            <div className="flex gap-2">
              <Button variant="sec" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={saving}
                className="flex-1 ">
                {saving ? "Saving…" : editingId ? "Update" : "Add item"}
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
        {!loading && items.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <Text variant="heading_small" className="mb-2">No digital assets yet</Text>
            <Text superFaded className=" max-w-xs mb-6">
              Record your digital accounts so your family knows what to do with them.
            </Text>
            <Button onClick={openAdd}>
              Add first item
            </Button>
          </div>
        )}

        {/* Grouped list */}
        {!loading && Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="space-y-2">
            <Text variant="body_small" superFaded className="uppercase tracking-wider px-1">{cat}</Text>
            {catItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Text className="truncate">{item.serviceName}</Text>
                    {item.username && (
                      <Text variant="body_small_sec" className="mt-0.5">{maskUsername(item.username)}</Text>
                    )}
                  </div>
                  <span className="rounded-full bg-dusk-ink/6 px-2.5 py-0.5 font-sans text-xs text-dusk-ink/60 flex-shrink-0">
                    {item.onDeathInstruction}
                  </span>
                </div>
                {item.notes && (
                  <Text variant="body_small" superFaded className="leading-relaxed line-clamp-2">{item.notes}</Text>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => openEdit(item)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex-1 "
                  >
                    {deletingId === item.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
