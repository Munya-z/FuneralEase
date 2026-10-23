"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken } from "@/lib/auth";

const nav = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    label: "Households",
    href: "/households",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.552 20.552 21 20 21H15V15H9V21H4C3.448 21 3 20.552 3 20V9.5Z" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    label: "Legal directory",
    href: "/legal-directory",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M6 21V7l6-4 6 4v14M9 21v-5h6v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Parlour queue",
    href: "/parlours",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M6 7V5C6 3.895 6.895 3 8 3H16C17.105 3 18 3.895 18 5V7" stroke="currentColor" strokeWidth="1.75" />
        <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Claims",
    href: "/claims",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7C5.895 5 5 5.895 5 7V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V7C19 5.895 18.105 5 17 5H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
        <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <line x1="9" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/billing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.75" />
        <line x1="6" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Burial societies",
    href: "/burial-societies",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Audit log",
    href: "/audit-log",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 12H15M9 16H12M17 21H7C5.895 21 5 20.105 5 19V5C5 3.895 5.895 3 7 3H14L19 8V19C19 20.105 18.105 21 17 21Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function signOut() {
    clearAdminToken();
    router.replace("/");
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-dusk-ink flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/8">
        <p className="font-serif text-base font-semibold text-warm-paper">
          Funeral<span className="text-candlewick">Ease</span>
        </p>
        <p className="font-mono text-xs text-warm-paper/30 mt-0.5">Admin portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors ${
                active
                  ? "bg-white/10 text-warm-paper font-medium"
                  : "text-warm-paper/50 hover:text-warm-paper/80 hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/8 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-warm-paper/10 flex items-center justify-center">
            <span className="font-sans text-xs font-semibold text-warm-paper/60">A</span>
          </div>
          <div>
            <p className="font-sans text-xs font-medium text-warm-paper/70">Staff</p>
            <p className="font-sans text-xs text-warm-paper/30">Admin scope</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-lg border border-white/10 px-3 py-2 font-sans text-xs font-medium text-warm-paper/50 transition hover:bg-white/5 hover:text-warm-paper"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
