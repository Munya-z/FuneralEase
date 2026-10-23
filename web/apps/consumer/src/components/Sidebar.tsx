"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArchMark } from "@/components/Logo";
import { clearTokens, getStoredName } from "@/lib/auth";

const sections = [
  {
    title: null,
    items: [
      {
        label: "Home",
        href: "/home",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      },
    ],
  },
  {
    title: "Policies",
    items: [
      {
        label: "Policy Vault",
        href: "/vault",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" /><circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.75" /><path d="M7 7V5.5C7 4.119 8.119 3 9.5 3H14.5C15.881 3 17 4.119 17 5.5V7" stroke="currentColor" strokeWidth="1.75" /></svg>,
      },
      {
        label: "Claims",
        href: "/claims",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.75" /><path d="M8.5 10L11 12.5L15.5 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /><line x1="8" y1="16.5" x2="16" y2="16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
      {
        label: "Coverage",
        href: "/coverage",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      },
    ],
  },
  {
    title: "Estate",
    items: [
      {
        label: "Funeral Wishes",
        href: "/wishes",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22V12M12 12C12 12 6 8 6 4a6 6 0 0 1 12 0c0 4-6 8-6 8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
      {
        label: "Digital Vault",
        href: "/digital-vault",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" /><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
      {
        label: "Estate Checklist",
        href: "/estate-checklist",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.75" /><path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /><line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
      {
        label: "Obituary",
        href: "/obituary",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        label: "Family",
        href: "/family",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.75" /><circle cx="17" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.75" /><path d="M3 20C3 16.686 5.686 14 9 14C12.314 14 15 16.686 15 20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /><path d="M15 15.5C15.9 14.9 17 14.5 18 14.5C20.2 14.5 22 16 22 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
      {
        label: "Burial Society",
        href: "/burial-society",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
      {
        label: "Fundraiser",
        href: "/fundraiser",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      },
      {
        label: "Grief Journal",
        href: "/grief-journal",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      },
    ],
  },
  {
    title: "Directory",
    items: [
      {
        label: "Parlours",
        href: "/parlours",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" stroke="currentColor" strokeWidth="1.75" /><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" /></svg>,
      },
      {
        label: "Legal Directory",
        href: "/legal-directory",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6l9-4 9 4v6c0 5.25-3.75 10.15-9 11.5C6.75 22.15 3 17.25 3 12V6z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      },
      {
        label: "Resources",
        href: "/resources",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Notifications",
        href: "/notifications",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>,
      },
      {
        label: "Upgrade",
        href: "/upgrade",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getStoredName());
  }, []);

  function handleLogout() {
    clearTokens();
    router.push("/onboarding");
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-dusk-ink/8 fixed left-0 top-0 z-40">
      {/* Logo — fixed at top */}
      <div className="flex-shrink-0 flex items-center gap-2.5 px-5 py-5 border-b border-dusk-ink/8">
        <ArchMark size={24} className="text-dusk-ink" />
        <span className="font-serif text-base font-semibold text-dusk-ink">
          Funeral<span className="text-candlewick">Ease</span>
        </span>
      </div>

      {/* Nav — scrollable middle */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title ?? "main"} className="mb-4">
            {section.title && (
              <p className="font-sans text-[10px] font-semibold text-dusk-ink/30 uppercase tracking-wider px-3 mb-1">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-bdr-inr transition-colors ${active
                      ? "bg-dusk-ink text-warm-paper"
                      : "text-dusk-ink/50 hover:bg-dusk-ink/5 hover:text-dusk-ink"
                      }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="font-sans text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout — always visible at bottom */}
      <div className="flex-shrink-0 px-3 py-4 border-t border-dusk-ink/8 space-y-1">
        {name && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-dusk-ink/10 flex items-center justify-center flex-shrink-0">
              <span className="font-sans text-xs font-semibold text-dusk-ink">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-sans text-sm font-medium text-dusk-ink truncate">{name.split(" ")[0]}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-dusk-ink/40 hover:bg-ember/6 hover:text-ember transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span className="font-sans text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
