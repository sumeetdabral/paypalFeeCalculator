import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PayPal Fee Calculator - Calculate PayPal Fees Instantly",
  description: "Free PayPal fee calculator. Calculate PayPal fees for domestic and international transactions. Find out how much to request to receive your desired amount after fees.",
  keywords: "PayPal fees, PayPal calculator, payment fees, transaction fees, PayPal charges",
  authors: [{ name: "PayPal Calculator" }],
  openGraph: {
    title: "PayPal Fee Calculator",
    description: "Calculate PayPal fees instantly for any transaction amount",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
