"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { clearAdminToken, isAdminAuthenticated } from "@/lib/auth";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      clearAdminToken();
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-paper">
        <p className="font-mono text-xs uppercase tracking-widest text-dusk-ink/40">Verifying session…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-warm-paper/40">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
