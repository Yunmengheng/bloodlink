import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "BloodLink KH — Every drop finds its match",
    template: "%s · BloodLink KH",
  },
  description:
    "BloodLink KH privately matches urgent blood requests in Cambodia with compatible, eligible donors. Bilingual Khmer and English.",
  applicationName: "BloodLink KH",
  keywords: [
    "blood donation",
    "Cambodia",
    "Phnom Penh",
    "blood donor",
    "ឈាម",
  ],
  openGraph: {
    title: "BloodLink KH — Every drop finds its match",
    description:
      "Privately match urgent blood requests with compatible, eligible donors in Cambodia.",
    siteName: "BloodLink KH",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  // Mobile-first: the app is designed for phones before desktop.
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF9",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: browser extensions (ad blockers, antivirus
    // page scanners) inject attributes onto <html> and <body> before React
    // hydrates. Those diffs are cosmetic and not ours to fix.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        {/* Keyboard users can jump past the header straight to the content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lift"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
