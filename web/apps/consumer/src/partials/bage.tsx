// for ststus boxes
import React from 'react';

type BageVariant = 'success' | 'warning' | 'failed' | 'pending';

interface BageProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: BageVariant;
    children: React.ReactNode;
}

const BASE_STYLES = "rounded_bdr_inr px-2.5 py-0.5 font-sans text-[11px]";

const VARIANTS: Record<BageVariant, string> = {
    success: "bg-sage/10 text-sage",
    warning: "bg-ember/10 text-ember",
    failed: "bg-red-600 text-warm-paper hover:bg-red-700 focus:ring-red-500",
    pending: "bg-candlewick/15 text-candlewick",
};


export default function Button({
    children,
    variant = 'success',
    className = '',
    ...props
}: BageProps) {

    const bageStyles = `${BASE_STYLES} ${VARIANTS[variant] || VARIANTS.success} ${className}`;

    return (
        <button className={bageStyles} {...props}>
            {children}
        </button>
    );
}