import React from 'react';

type TextVariant = 'heading_main' | 'heading_sub' | 'body_sec' | 'body_small_sec' | 'heading_sec_lg' | 'heading_small' | 'heading_sec' | 'body' | 'body_small';
type TextColor = 'light' | 'dark' | 'candle';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
    variant?: TextVariant;
    color?: TextColor;
    faded?: boolean;
    superFaded?: boolean;
    as?: React.ElementType;
    className?: any;
    children: React.ReactNode;
}

const STYLES = {
    heading_main: "animate-fade-up-delay font-serif text-4xl font-semibold leading-[1.15] text-balance sm:text-5xl lg:max-w-xl",
    heading_sub: "font-serif text-2xl max-w-lg font-semibold text-balance",
    heading_small: "font-serif text-xl font-semibold",
    heading_sec: "font-mono text-xs uppercase tracking-[0.11em]",
    heading_sec_lg: "font-mono text-3xl uppercase font-bold tracking-[0.11em] ",
    body: " font-sans text-base leading-relaxed lg:mx-0",
    body_sec: "font-mono text-sm font-medium",
    body_small_sec: "font-mono text-xs  ",
    body_small: "font-sans text-xs leading-relaxed",
};

const VARIANTS = {
    light: "text-warm-paper",
    dark: "text-dusk-ink",
    candle: "text-candlewick"
};

export default function Text({
    variant = 'body',
    color = 'dark',
    faded = false,
    superFaded = false,
    className = '',
    children,
    as: Component = 'p', // can also be h1, h2 and so on 
    ...props
}: TextProps) {

    const opacityClass = superFaded ? 'opacity-40' : faded ? 'opacity-80' : '';

    const classes = [
        STYLES[variant as TextVariant],
        VARIANTS[color as TextColor],
        opacityClass,
        className
    ].filter(Boolean).join(' ');

    const Tag = Component as React.ElementType;

    return <Tag className={classes}>{children}</Tag>;
}
