import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Continuity Matrix — for HexCoded creative teams",
  description:
    "Pick one actor, one product, one setting. Get 50 on-brand ad variants with the same face, outfit, and product in every single cut. A Creative Studio power-tool for HexCoded.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-bg text-ink">{children}</body>
    </html>
  );
}
