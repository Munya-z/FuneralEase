"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth";

const tabs = [
  {
    label: "Home",
    href: "/home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Vault",
    href: "/vault",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M7 7V5.5C7 4.119 8.119 3 9.5 3H14.5C15.881 3 17 4.119 17 5.5V7" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    label: "Claims",
    href: "/claims",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8.5 10L11 12.5L15.5 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="8" y1="16.5" x2="16" y2="16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Family",
    href: "/family",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="17" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M3 20C3 16.686 5.686 14 9 14C12.314 14 15 16.686 15 20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M15 15.5C15.9 14.9 17 14.5 18 14.5C20.2 14.5 22 16 22 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearTokens();
    router.push("/onboarding");
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-dusk-ink/10 pb-safe">
      <div className="mx-auto flex max-w-sm items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-dusk-ink" : "text-dusk-ink/35 hover:text-dusk-ink/60"
              }`}
            >
              {tab.icon}
              <span className={`font-sans text-[10px] font-medium tracking-wide ${active ? "text-dusk-ink" : "text-dusk-ink/35"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-dusk-ink/35 hover:text-ember transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span className="font-sans text-[10px] font-medium tracking-wide">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
