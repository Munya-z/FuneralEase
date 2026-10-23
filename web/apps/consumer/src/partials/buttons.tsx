/// this file contain all the button styling tamplates
import React from 'react';

type ButtonVariant = 'main' | 'sec' | 'danger' | 'outline' | 'outline_dark'| 'delete';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const BASE_STYLES = "px-8 rounded_bdr_inr text-center  py-3.5 font-sans text-sm font-semibold active:scale-[0.98] disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  main: "inline-block bg-dusk-ink text-sm font-semibold text-warm-paper transition hover:bg-dusk-ink/90 ",
  sec: "bg-warm-paper text-dusk-ink transition hover:bg-warm-paper/90 ",
  danger: "bg-red-600 text-warm-paper hover:bg-red-700 focus:ring-red-500",
  outline: "border border-warm-paper/20 text-warm-paper/85 transition hover:border-warm-paper/40 hover:text-warm-paper ",
  delete: "rounded-xl border border-ember/20 py-2 font-sans text-xs font-medium text-ember/70 hover:text-ember transition-colors disabled:opacity-40",
  outline_dark: "border border-warm-paper/20 text-dusk-ink/85 transition hover:border-dusk-ink/40 hover:text-dusk-ink "
};


export default function Button({
  children,
  variant = 'main',
  className = '',
  ...props
}: ButtonProps) {

  const buttonStyles = `${BASE_STYLES} ${VARIANTS[variant] || VARIANTS.main} ${className}`;

  return (
    <button className={buttonStyles} {...props}>
      {children}
    </button>
  );
}


