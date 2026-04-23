import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Cannes Experience",
  description: "Choose your Cannes experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${avantGarde.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
