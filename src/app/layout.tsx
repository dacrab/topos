import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import * as Sentry from "@sentry/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { template: "%s | Topos", default: "Topos - Real Estate Platform" },
  description:
    "Modern multi-tenant real estate brokerage platform for managing listings, contacts, and transactions.",
  openGraph: {
    title: "Topos - Real Estate Platform",
    description:
      "Modern multi-tenant real estate brokerage platform for managing listings, contacts, and transactions.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Sentry.ErrorBoundary fallback={<p>An error occurred</p>}>
              {children}
            </Sentry.ErrorBoundary>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
