"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { isAdminAuthenticated, setAdminToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminAuthenticated()) router.replace("/dashboard");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await auth.staffLogin(email, password, totp || undefined);
      setAdminToken(result.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dusk-ink px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,165,79,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(94,133,113,0.1),_transparent_50%)]" />

      <div className="relative w-full max-w-sm space-y-8 animate-fade-up">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm-paper/30 mb-3">
            Staff portal
          </p>
          <h1 className="font-serif text-3xl font-semibold text-warm-paper">
            Funeral<span className="text-candlewick">Ease</span> Admin
          </h1>
          <p className="mt-2 font-sans text-sm text-warm-paper/45">
            Secure access for operations and moderation
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-center font-sans text-sm text-ember">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-medium text-warm-paper/50">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@funeralease.co.za"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-warm-paper/15 bg-white/8 px-4 py-3 font-sans text-sm text-warm-paper placeholder:text-warm-paper/25 focus:outline-none focus:ring-2 focus:ring-warm-paper/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-medium text-warm-paper/50">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-warm-paper/15 bg-white/8 px-4 py-3 font-sans text-sm text-warm-paper focus:outline-none focus:ring-2 focus:ring-warm-paper/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-medium text-warm-paper/50">
              Authenticator code <span className="text-warm-paper/30">(if enabled)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-warm-paper/15 bg-white/8 px-4 py-3 font-mono text-xl tracking-[0.35em] text-warm-paper placeholder:text-warm-paper/20 text-center focus:outline-none focus:ring-2 focus:ring-warm-paper/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-warm-paper py-3 font-sans text-sm font-semibold text-dusk-ink transition hover:bg-warm-paper/90 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
