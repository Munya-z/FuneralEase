"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-warm-paper">
      <Sidebar />
      {/* main content — offset by sidebar width on desktop */}
      <div className="flex flex-col flex-1 lg:ml-64 min-h-screen">
        <div className="flex-1 pb-20 lg:pb-0">{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}
