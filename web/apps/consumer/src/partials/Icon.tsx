/// this file contain all the box styling tamplates
import React from 'react';

type IconVariant = 'dark' | 'light' | 'sage';
type IconSize = 'small' | 'medium' | "large";

interface IconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
    variant?: IconVariant;
    children: React.ReactNode;
    className?: any;
    size?: IconSize;
}

const BASE_STYLES = " transition-colors";

const SIZES = {
    small: `width="14" height="14 viewBox="0 0 24"`,
    medium: `width="24" height="24 viewBox="0 0 24"`,
    large: `width="34" height="34 viewBox="0 0 24" `
};

const VARIANTS: Record<IconVariant, string> = {
    dark: "Text-dusk-ink/40  group-hover:text-dusk-ink/70 ",
    light: "Text-warm-paper/40  group-hover:text-warm-paper/70 ",
    sage: "text-sage"
};


export default function Icon({
    children,
    size = 'medium',
    variant = 'dark',
    className = '',
    ...props
}: IconProps) {

    const iconStyles = `${BASE_STYLES} ${VARIANTS[variant] || VARIANTS.light} ${className}`;
    const classes = [
        VARIANTS,
        className
    ].filter(Boolean).join(' ');

    return (
        <svg fill="none" className={classes}  {...props}>
            {children}
        </svg>
    );
}