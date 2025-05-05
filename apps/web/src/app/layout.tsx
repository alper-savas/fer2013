import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Copyright } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FER App | Find the Outlier",
  description: "FER App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-grid-small-white/[0.18] -skew-y-12" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-transparent" />
          <div className="absolute h-[1000px] w-[1000px] rounded-full bg-blue-500/15 blur-[120px] -top-[400px] -right-[400px]" />
          <div className="absolute h-[1000px] w-[1000px] rounded-full bg-purple-500/15 blur-[120px] -bottom-[400px] -left-[400px]" />

          {/* Main Content */}
          <main className="relative">
            {children}
          </main>

          {/* Copyright Footer */}
          <div className="border-t border-slate-800/50 mt-12 pt-8 pb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Copyright className="h-4 w-4" />
              <span>{currentYear}</span>
              <span className="text-slate-400">Made by Alper Savas</span>
              <span className="text-slate-600">•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
