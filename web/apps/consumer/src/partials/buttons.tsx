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


// for otp find a place to add these 

// export default function OtpVerification() {
//   const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
//   const [otp, setOtp] = useState<string>("");
  
//   // Explicitly type the ref array for your 6 elements
//   const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
//     const val = e.target.value.replace(/\D/g, "").slice(-1);
//     const next = [...otpDigits];
//     next[i] = val;
//     setOtpDigits(next);
//     setOtp(next.join(""));
    
//     // Automatically shift focus forward if a digit is entered
//     if (val && i < 5) {
//       otpRefs.current[i + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number, digit: string) => {
//     // Automatically shift focus backward on Backspace if the field is empty
//     if (e.key === "Backspace" && !digit && i > 0) {
//       otpRefs.current[i - 1]?.focus();
//     }
//   };

//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
//     if (!pasted) return;
    
//     e.preventDefault();
//     const next = [...otpDigits];
//     pasted.split("").forEach((ch, idx) => { 
//       if (idx < 6) next[idx] = ch; 
//     });
    
//     setOtpDigits(next);
//     setOtp(next.join(""));
    
//     // Focus the next empty field or the very last field
//     otpRefs.current[Math.min(pasted.length, 5)]?.focus();
//   };