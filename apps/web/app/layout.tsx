// Copied from /columbus-ai:app/layout.tsx (Phase 0 UI shell only — Stripe Script removed)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChatWidget } from "@/components/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Columbus AI Automation Solutions LLC",
  description:
    "Columbus AI Automation Solutions LLC helps businesses streamline workflows, reduce manual tasks, and improve response times with reliable automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex flex-col flex-1">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
