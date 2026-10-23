"use client";

import { useState, useRef, useEffect } from "react";
import { Text, Button, Input } from "@/partials";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArchMark } from "@/components/Logo";
import { auth } from "@/lib/api";
import { setTokens, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) router.replace("/home");
  }, [router]);

  const pin = pinDigits.join("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tokens = await auth.loginWithPin(phone, pin);
      // Decode name from JWT claims
      const payload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
      const name = payload.name ?? "";
      setTokens(tokens.accessToken, tokens.refreshToken, name);
      router.push("/home");
    } catch {
      setError("Invalid mobile number or PIN. Please try again.");
      setPinDigits(["", "", "", "", "", ""]);
      pinRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-warm-paper px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <ArchMark size={28} className="text-dusk-ink" />
          <span className="font-serif text-lg font-semibold text-dusk-ink">
            Funeral<span className="text-candlewick">Ease</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Text as="h1" variant="heading_sub">Sign in</Text>
            <Text faded className="mt-2">
              Enter your mobile number and PIN to access your vault.
            </Text>
          </div>

          {/* Mobile number */}
          <div className="space-y-1">
            <Input
              label="Mobile number"
              variant="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +27 82 123 4567"
              required
              autoFocus
              className="w-full"
            />
          </div>

          {/* PIN */}
          <div className="space-y-2">
            <Text as="label" variant="body_small" faded>
              6-digit PIN
            </Text>
            <div className="flex gap-2 justify-between">
              {pinDigits.map((digit, i) => (
                <Input
                  variant="otp"
                  key={i}
                  ref={(el) => { pinRefs.current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
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
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (!pasted) return;
                    e.preventDefault();
                    const next = [...pinDigits];
                    pasted.split("").forEach((ch, idx) => { if (idx < 6) next[idx] = ch; });
                    setPinDigits(next);
                    pinRefs.current[Math.min(pasted.length, 5)]?.focus();
                  }}
                  className="w-full"
                />
              ))}
            </div>
          </div>

          {error && <p className="font-sans text-xs text-ember">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !phone || pin.length < 6}
            className="mx-auto w-full"

          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <Text variant="body" faded className="text-center">
            New here?{" "}
            <Link href="/onboarding" className="text-dusk-ink underline underline-offset-2">
              Create your vault
            </Link>
          </Text>
        </form>
      </div>
    </main>
  );
}
