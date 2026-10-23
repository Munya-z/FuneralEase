/// this file contain all the input styling tamplates
import React, { useId, forwardRef } from 'react';

type InputVariant = 'text' | 'phone' | 'otp' | 'pin' | 'checkbox';

const BASE_STYLES = " rounded-bdr border border-dusk-ink/20 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20 text-dusk-ink bg-white";

const VARIANTS: Record<InputVariant, string> = {
  text: `${BASE_STYLES} w-full px-4 py-3.5 font-sans text-sm placeholder:text-dusk-ink/30`,

  phone: `${BASE_STYLES} w-full px-4 py-3.5 font-sans text-sm placeholder:text-dusk-ink/30 `,

  otp: `${BASE_STYLES} aspect-square font-mono text-xl font-semibold text-center `,

  pin: `${BASE_STYLES} aspect-square font-mono text-xl font-semibold text-center`,

  checkbox: "h-4 w-4 flex-shrink-0 rounded border-dusk-ink/20 accent-dusk-ink focus:ring-2 focus:ring-dusk-ink/20 ",
};


const Input = forwardRef<HTMLInputElement, {
  label?: string;
  variant?: InputVariant;
  className?: string;
  type?: string;
  children?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>>(function Input({
  label,
  variant = 'text',
  className = '',
  type,
  children,
  ...props
}, ref) {

  const inputStyles = `${VARIANTS[variant] || VARIANTS.text} ${className}`;
  const inputType = type || (variant === 'checkbox' ? 'checkbox' : 'text');

  if (variant === 'checkbox') {
    return (
      <div className="flex items-start gap-2">
        {(label || children) && (
          <label className="flex items-start gap-3 cursor-pointer ">
            <input
              type="checkbox"
              ref={ref}
              className={inputStyles}
              {...props}
            />
            {label || children}
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="font-sans text-xs font-medium text-dusk-ink/60">
          {label}
        </label>
      )}
      <input
        type={inputType}
        ref={ref}
        className={inputStyles}
        {...props}
      />
    </div>
  );

});

Input.displayName = 'Input';

export default Input;