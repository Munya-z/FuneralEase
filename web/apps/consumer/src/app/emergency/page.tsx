"use client";

import { useState } from "react";
import { Text, Button, Input } from "@/partials";

import { ArchMark } from "@/components/Logo";
import { auth, emergency as emergencyApi } from "@/lib/api";
import { setTokens } from "@/lib/auth";

type Step = "phone" | "otp" | "granted";

export default function EmergencyPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactId, setContactId] = useState("");

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.requestOtp(phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tokens = await auth.verifyOtp(phone, otp, "Emergency User", false);
      setTokens(tokens.accessToken, tokens.refreshToken);
      // In a real flow, contactId would be passed via URL param
      setStep("granted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-dusk-ink">
      <div className="mx-auto w-full max-w-sm flex-1 px-6 py-10">
        <div className="flex items-center gap-2 mb-10">
          <ArchMark size={28} className="text-candlewick" />
          <span className="font-serif text-lg font-semibold text-warm-paper">
            Funeral<span className="text-candlewick">Ease</span>
          </span>
        </div>

        {step === "phone" && (
          <form onSubmit={requestOtp} className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-ember/20 border border-ember/30 px-3 py-1 mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse" />
                <span className="font-mono text-xs text-ember uppercase tracking-wider">Emergency access</span>
              </div>
              <Text as="h2" variant="heading_sub" color="light">
                Request access to a family vault
              </Text>
              <Text className="mt-2" color="light" faded>
                You&apos;ve been designated as an emergency contact. Enter your
                registered mobile number to verify your identity.
              </Text>
            </div>

            <div className="space-y-1.5">
              <label className="small_light_txt text_super_faded">Your mobile number</label>
              <Input
                variant="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 082 123 4567"
                required
                className="w-full"
              />
            </div>
            {error && <p className="font-sans text-xs text-ember">{error}</p>}
            <Button
              type="submit"
              variant="sec"
              disabled={loading || !phone}
              className="w-full"
            >
              {loading ? "Sending code…" : "Send verification code"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyAndRequest} className="space-y-6">
            <div>
              <Text as="h2" className="main_sub_heading_txt_light">Enter your code</Text>
              <Text className="mt-2 norm_light_txt text_faded">
                Sent to <Text as="span" className="sec_heading_txt_light">{phone}</Text>
              </Text>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              className="w-full"
            />
            {error && <p className="font-sans text-xs text-ember">{error}</p>}
            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full "
            >
              {loading ? "Verifying…" : "Access vault"}
            </Button>
          </form>
        )}

        {step === "granted" && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-sage/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-sage">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <Text as="h2" variant="heading_sub" color="light" >Access granted</Text>
              <Text className="mt-2" color="light" faded>
                You now have access to the family vault. This access will expire in 30 days and all activity is logged.
              </Text>
            </div>
            <div className="rounded_bdr bg-white/8 border border-white/10 px-4 py-4 space-y-2">
              {["View all policies and insurer contacts", "Download policy documents", "Access claims checklists"].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-sage" />
                  <Text variant="heading_small" faded >{item}</Text>
                </div>
              ))}
            </div>
            <Button
              onClick={() => window.location.href = "/vault"}
              className="w-full"
            >
              View vault
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
