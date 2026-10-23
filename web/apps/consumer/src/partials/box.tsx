/// this file contain all the box styling tamplates
import React from 'react';

type BoxVariant = 'dark' | 'light' | 'clear';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BoxVariant;
  children: React.ReactNode;
  className?: any;
}

const BASE_STYLES = "rounded-bdr px-4 py-4 overflow-hidden";

const VARIANTS: Record<BoxVariant, string> = {
  dark: "bg-dusk-ink space-y-1 ",
  light: "bg-white border border-dusk-ink/30 ",
  clear: "border border-dusk-ink/30 ",
};


export default function Box({
  children,
  variant = 'light',
  className = '',
  ...props
}: BoxProps) {

  const boxStyles = `${BASE_STYLES} ${VARIANTS[variant] || VARIANTS.light} ${className}`;

  return (
    <div className={boxStyles}  {...props}>
      {children}
    </div>
  );
}

