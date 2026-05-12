import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const avantGarde = localFont({
  src: [
    {
      path: "./fonts/AvantGardeForSalesforceW05-Dm.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/AvantGardeForSalesforceW05-Dm.woff",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-avant-garde",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1 TrackStar — Cannes Lions 2026",
  description: "Make your podium track",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${avantGarde.variable} ${cormorantGaramond.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
