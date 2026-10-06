import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
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
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>{children}</body>
    </html>
  );
}
