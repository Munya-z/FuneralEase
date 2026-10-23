"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { getToken } from "@/lib/auth";
import { notifications as notificationsApi, type NotificationSettingsDto } from "@/lib/api";
import { Text, Button, Input } from "@/partials";


const PREFS = [
  {
    id: "premiumDue" as keyof NotificationSettingsDto,
    label: "Premium due reminders",
    description: "7 days and 1 day before a premium is due",
  },
  {
    id: "premiumOverdue" as keyof NotificationSettingsDto,
    label: "Overdue alerts",
    description: "Immediate alert when a premium goes past due date",
  },
  {
    id: "lapseWarning" as keyof NotificationSettingsDto,
    label: "Lapse warnings",
    description: "Alert when a policy is at risk of lapsing",
  },
  {
    id: "claimUpdates" as keyof NotificationSettingsDto,
    label: "Claim status updates",
    description: "Notify when a claim checklist item is completed",
  },
  {
    id: "emergencyAccess" as keyof NotificationSettingsDto,
    label: "Emergency access alerts",
    description: "When a contact requests or is granted access",
  },
  {
    id: "referralJoins" as keyof NotificationSettingsDto,
    label: "Referral activity",
    description: "When someone joins using your referral code",
  },
] as const;

const DEFAULTS: NotificationSettingsDto = {
  premiumDue: true,
  premiumOverdue: true,
  lapseWarning: true,
  claimUpdates: true,
  emergencyAccess: true,
  referralJoins: false,
};

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettingsDto>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    notificationsApi.getSettings(token)
      .then(setSettings)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: keyof NotificationSettingsDto) {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  }

  async function save() {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const updated = await notificationsApi.updateSettings(token, settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <AppHeader title="Notifications" />

      <div className="px-6 py-6 space-y-6">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light">Notifications</Text>
          <Text faded color="light">Choose which alerts you receive via WhatsApp or SMS.</Text>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          {PREFS.map((pref, i) => (
            <div
              key={pref.id}
              className={`flex items-center gap-4 px-4 py-4 ${i < PREFS.length - 1 ? "border-b border-dusk-ink/6" : ""}`}
            >
              <div className="flex-1">
                <Text>{pref.label}</Text>
                <Text superFaded variant="body_small" className="mt-0.5">{pref.description}</Text>
              </div>
              {loading ? (
                <div className="h-6 w-11 rounded-full bg-dusk-ink/10 animate-pulse" />
              ) : (
                <button
                  role="switch"
                  aria-checked={settings[pref.id]}
                  onClick={() => toggle(pref.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings[pref.id] ? "bg-dusk-ink" : "bg-dusk-ink/20"
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${settings[pref.id] ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-dusk-ink/5 ring-1 ring-dusk-ink/8 px-4 py-3">
          <Text variant="body_small" superFaded >
            Notifications are delivered via WhatsApp or SMS depending on your subscription tier. Critical lapse warnings are always sent regardless of these settings.
          </Text>
        </div>

        <Button
          onClick={save}
          disabled={saving || loading}
          className="w-full"
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}
