import Link from "next/link";

function ArchMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M8 36 C8 36 8 20 20 12 C32 20 32 36 32 36"
        stroke="#F3EEE3"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="20" cy="23" rx="4" ry="5.5" fill="#E5A54F" />
    </svg>
  );
}

export default function ParlourHome() {
  return (
    <main className="min-h-screen bg-dusk-ink flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-2">
        <ArchMark size={32} />
        <span className="font-serif text-base font-semibold text-warm-paper">FuneralEase</span>
        <span className="ml-1 font-sans text-xs text-warm-paper/40">for Parlours</span>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-xl mx-auto w-full space-y-8">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-warm-paper/30">
            Funeral home portal
          </p>
          <h1 className="font-serif text-4xl font-semibold text-warm-paper leading-snug">
            Reach families when they need you most.
          </h1>
          <p className="font-sans text-sm text-warm-paper/60 leading-relaxed max-w-sm mx-auto">
            List your funeral home on FuneralEase and receive quote requests
            directly from families in your area — no commission, no middleman.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
            <p className="font-mono text-2xl font-medium text-candlewick">400+</p>
            <p className="font-sans text-xs text-warm-paper/40 mt-0.5">Families registered</p>
          </div>
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-center">
            <p className="font-mono text-2xl font-medium text-candlewick">Free</p>
            <p className="font-sans text-xs text-warm-paper/40 mt-0.5">To list your parlour</p>
          </div>
        </div>

        <div className="space-y-3 w-full max-w-sm">
          <Link
            href="/claim"
            className="block w-full rounded-xl bg-candlewick py-3.5 text-center font-sans text-sm font-semibold text-white transition hover:bg-candlewick/90"
          >
            Claim your listing — free
          </Link>
          <Link
            href="/directory"
            className="block w-full rounded-xl border border-warm-paper/20 py-3.5 text-center font-sans text-sm font-medium text-warm-paper/70 transition hover:border-warm-paper/40 hover:text-warm-paper"
          >
            Browse the directory
          </Link>
          <Link
            href="/manage"
            className="block w-full text-center font-sans text-xs text-warm-paper/30 py-1 transition hover:text-warm-paper/50"
          >
            Already listed? Manage your listing
          </Link>
        </div>
      </div>

      {/* Trust footer */}
      <footer className="px-6 py-6 border-t border-white/8">
        <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            "POPIA compliant",
            "No commission taken",
            "CIPC verified listings",
          ].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#5E8571" strokeWidth="1.5" />
                <path d="M3.5 6L5.5 8L8.5 4.5" stroke="#5E8571" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-sans text-xs text-warm-paper/40">{t}</span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
