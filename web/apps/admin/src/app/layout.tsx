import type { Metadata } from "next";
import { Lora, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora", weight: ["400", "600"], display: "swap" });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600"], display: "swap" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: "FuneralEase Admin",
  description: "Internal staff portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased bg-warm-paper">{children}</body>
    </html>
  );
}
