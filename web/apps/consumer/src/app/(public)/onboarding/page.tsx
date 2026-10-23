"use client";

import { useState, useRef, useEffect } from "react";
import { Text, Button, Input } from "@/partials";
import { useRouter } from "next/navigation";
import { ArchMark } from "@/components/Logo";
import { auth } from "@/lib/api";
import { setTokens, getStoredName, getToken } from "@/lib/auth";

type Step = "phone" | "otp" | "name" | "pin";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [fullName, setFullName] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(false);
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pendingToken, setPendingToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    setIsReturningUser(!!getStoredName());
  }, []);

  const steps: Step[] = isReturningUser ? ["phone", "otp"] : ["phone", "otp", "name", "pin"];
  const stepIndex = steps.indexOf(step);

  async function handlePhoneSubmit(e: React.FormEvent) {
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

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const storedName = getStoredName();
      if (storedName) {
        // Returning user — use stored name directly
        const tokens = await auth.verifyOtp(phone, otp, storedName, true);
        setTokens(tokens.accessToken, tokens.refreshToken, storedName);
        router.push("/home");
      } else {
        // New user — need name step first
        setStep("name");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
      setLoading(false);
    }
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tokens = await auth.verifyOtp(phone, otp, fullName, popiaConsent);
      setTokens(tokens.accessToken, tokens.refreshToken, fullName);
      setPendingToken(tokens.accessToken);
      setStep("pin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const pin = pinDigits.join("");
    try {
      const token = pendingToken || getToken() || "";
      await auth.setPin(token, pin);
      router.push("/home");
    } catch {
      // PIN setup is optional — still let them in
      router.push("/home");
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-warm-paper overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(229,165,79,0.14),_transparent_70%)]" aria-hidden />
      <div className="relative mx-auto w-full max-w-sm flex-1 px-6 py-10 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <ArchMark size={28} className="text-dusk-ink" />
          <span className="font-serif text-lg font-semibold text-dusk-ink">
            Funeral<span className="text-candlewick">Ease</span>
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded_bdr transition-colors ${i <= stepIndex ? "bg-dusk-ink" : "bg-dusk-ink/15"
                }`}
            />
          ))}
        </div>

        {/* Phone step */}
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <Text variant="heading_sub">
                {isReturningUser ? "Welcome back" : "Get started"}
              </Text>
              <Text faded>
                {isReturningUser
                  ? "Enter your mobile number to sign in."
                  : "We'll send a one-time code to verify it's you. No password needed."}
              </Text>
            </div>
            <div className="space-y-1">
              <Input
                label="Phone Number"
                variant="phone"
                placeholder="e.g +27 98 765 4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <p className="font-sans text-xs text-ember">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !phone}
              className="w-full disabled:opacity-50"
            >
              {loading ? "Sending code…" : "Send verification code"}
            </Button>
          </form>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <Text as="h2" variant="heading_sub" >
                Enter your code
              </Text>
              <Text faded>
                We sent a 6-digit code to{" "}
                <Text as="span" variant="heading_sec" color="dark">{phone}</Text>
              </Text>
            </div>
            <div className="flex gap-2 justify-between">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...otpDigits];
                    next[i] = val;
                    setOtpDigits(next);
                    setOtp(next.join(""));
                    if (val && i < 5) otpRefs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && i > 0) {
                      otpRefs.current[i - 1]?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (!pasted) return;
                    e.preventDefault();
                    const next = [...otpDigits];
                    pasted.split("").forEach((ch, idx) => { if (idx < 6) next[idx] = ch; });
                    setOtpDigits(next);
                    setOtp(next.join(""));
                    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
                  }}
                  autoFocus={i === 0}
                  className="w-full aspect-square rounded_bdr_inr border border-dusk-ink/20 bg-white font-mono text-xl font-semibold text-dusk-ink text-center focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                />
              ))}
            </div>
            {error && <p className="font-sans text-xs text-ember">{error}</p>}
            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full"
            >
              {loading ? "Signing in…" : "Continue"}
            </Button>
            <Button
              type="button"
              onClick={() => { setStep("phone"); setError(""); }}
              variant="outline"
              className="w-full"
            >
              Use a different number
            </Button>
          </form>
        )}

        {/* Name step — new users only */}
        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div>
              <Text as="h2" variant="heading_sub">
                What should we call you?
              </Text>
              <Text variant="body_small" className="mt-2">
                Your name will appear on your vault and emergency contact notifications.
              </Text>
            </div>
            <div className="space-y-1">
              <Input
                label="Full name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sipho Dlamini"
                required
                autoFocus
              />
            </div>
            <Input
              variant="checkbox"
              checked={popiaConsent}
              onChange={(e) => setPopiaConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-dusk-ink/30 accent-dusk-ink"
            >
              <Text as="span" variant="body_small" faded>
                I agree to FuneralEase&apos;s{" "}
                <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>{" "}
                and consent to my personal information being processed in accordance with POPIA.
              </Text>
            </Input>

            {error && <p className="font-sans text-xs text-ember">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !fullName.trim() || !popiaConsent}

            >
              {loading ? "Setting up your vault…" : "Create my vault"}
            </Button>
          </form>
        )}

        {/* PIN step — new users only */}
        {step === "pin" && (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
              <Text variant="heading_sub">
                Set your PIN
              </Text>
              <Text className="mt-2" faded>
                Choose a 6-digit PIN so you can sign in quickly next time — no OTP needed.
              </Text>
            </div>
            <div className="space-y-2">
              <label className="font-sans text-xs font-medium text-dusk-ink/60">6-digit PIN</label>
              <div className="flex gap-2 justify-between">
                {pinDigits.map((digit, i) => (
                  <Input
                    key={i}
                    variant="otp"
                    ref={(el) => { pinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={i === 0}
                    className="w-full"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...pinDigits];
                      next[i] = val;
                      setPinDigits(next);
                      if (val && i < 5) pinRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && i > 0) {
                        pinRefs.current[i - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            {error && <Text variant="body_small" className="text-ember">{error}</Text>}
            <Button
              type="submit"
              disabled={loading || pinDigits.join("").length < 6}
              className="w-full"
            >
              {loading ? "Saving…" : "Set PIN & open my vault"}
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/home")}
              className="w-full"
            >
              Skip for now
            </Button>
          </form>
        )}
      </div>
    </main >
  );
}
