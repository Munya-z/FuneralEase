"use client";

interface AppHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function AppHeader({ title, action }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-dusk-ink/8">
      <div className="flex w-full items-center justify-between px-6 h-14">
        <h1 className="font-sans text-sm font-semibold text-dusk-ink">{title}</h1>
        <div className="flex items-center gap-2">{action}</div>
      </div>
    </header>
  );
}
