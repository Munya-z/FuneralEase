interface LogoProps {
  size?: number;
  className?: string;
}

export function ArchMark({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.2)}
      viewBox="0 0 40 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Arch / doorway shape */}
      <path
        d="M4 48V22C4 11.507 11.163 4 20 4C28.837 4 36 11.507 36 22V48"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Base line */}
      <line
        x1="1"
        y1="48"
        x2="39"
        y2="48"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Flame / keyhole — teardrop pointing up */}
      <path
        d="M20 11C20 11 14.5 17 14.5 21.5C14.5 24.537 16.967 27 20 27C23.033 27 25.5 24.537 25.5 21.5C25.5 17 20 11 20 11Z"
        fill="#E5A54F"
      />
      {/* Keyhole slot */}
      <rect x="18.25" y="25.5" width="3.5" height="5" rx="1.75" fill="#E5A54F" />
    </svg>
  );
}

export function LogoLockup({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <ArchMark size={size} />
      <span className="font-serif text-xl font-semibold tracking-tight">
        Funeral<span className="text-candlewick">Ease</span>
      </span>
    </div>
  );
}
