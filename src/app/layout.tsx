import { ClerkProvider } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Literata } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ThemedToaster } from "@/components/ui/themed-toaster";
import { APP_CONFIG, appUrl } from "@/lib/config";
import "./globals.css";

const fontSans = IBM_Plex_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin", "greek"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin", "greek"],
  display: "swap",
});

const fontDisplay = Literata({
  variable: "--font-display",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin", "greek"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return {
    metadataBase: new URL(appUrl()),
    title: {
      template: `%s · ${APP_CONFIG.name}`,
      default: t("defaultTitle"),
    },
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#11120f" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <ClerkProvider>
      <html lang={locale} className="h-full" suppressHydrationWarning>
        <body
          className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} h-full bg-background font-sans text-foreground antialiased`}
        >
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Sentry.ErrorBoundary
                fallback={<p className="p-8 text-muted-foreground">An error occurred.</p>}
              >
                {children}
                <ThemedToaster />
              </Sentry.ErrorBoundary>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
