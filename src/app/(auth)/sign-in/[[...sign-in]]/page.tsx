"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";

export default function Page() {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-card p-10 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 scale-125">
          <Logo showText={false} />
        </div>
        <h2 className="text-3xl font-bold tracking-tighter text-foreground">
          {t("signInTitle")}
        </h2>
        <p className="text-sm text-muted-foreground mt-3 font-light tracking-wide">
          {t("signInSubtitle")}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={signIn}>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
            >
              {t("emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full border border-input bg-background py-3 px-4 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm placeholder:text-muted-foreground/50"
              placeholder="agent@agency.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
            >
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full border border-input bg-background py-3 px-4 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm placeholder:text-muted-foreground/50"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center bg-primary px-3 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("signInButton")}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href="/sign-up"
          className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          {tc("startFreeTrial")}
        </Link>
      </p>
    </div>
  );
}
