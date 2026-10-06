import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Khmer } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { getI18n } from "@/lib/i18n";
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
  keywords: ["blood donation", "Cambodia", "Phnom Penh", "blood donor", "ឈាម"],
  openGraph: {
    title: "BloodLink KH — Every drop finds its match",
    description:
      "Privately match urgent blood requests with compatible, eligible donors in Cambodia.",
    siteName: "BloodLink KH",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF9",
};

const geistSans = Geist({
  variable: "--font-latin",
  display: "swap",
  subsets: ["latin"],
});

// Khmer script needs its own face; Geist has no Khmer glyphs.
const notoKhmer = Noto_Sans_Khmer({
  variable: "--font-khmer",
  display: "swap",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { lang, t } = await getI18n();

  return (
    // suppressHydrationWarning: browser extensions inject attributes onto
    // <html> and <body> before React hydrates. Cosmetic, and not ours to fix.
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${notoKhmer.variable} ${
          // Khmer runs a little larger with looser leading; see globals.css.
          lang === "km" ? "lang-km" : ""
        } flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lift"
        >
          Skip to content
        </a>

        <SiteHeader lang={lang} t={t} />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter t={t} />

        <BottomTabBar t={t} />
        {/* Spacer so the fixed tab bar never covers the footer on mobile. */}
        <div className="h-16 md:hidden" aria-hidden="true" />
      </body>
    </html>
  );
}
