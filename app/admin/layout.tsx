import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// A second root layout: /admin sits outside app/[locale], so it renders its own
// <html>. Next allows this because there's no top-level app/layout.tsx (see the
// route-groups docs on multiple root layouts). It's deliberately not localized —
// this is an internal tool for the project team, English only.
export const metadata: Metadata = {
  title: "Admin | Sueños de una Monarca",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full bg-cream text-monarch-black antialiased">
        {children}
      </body>
    </html>
  );
}
