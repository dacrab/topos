"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Logo } from "@/components/common/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignUp = mode === "sign-up";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const options = {
      onRequest: () => setIsLoading(true),
      onSuccess: () => {
        window.location.href = "/dashboard";
      },
      onError: (ctx: { error: { message: string } }) => {
        setIsLoading(false);
        setError(ctx.error.message);
      },
    };

    if (isSignUp) {
      await authClient.signUp.email({ email, password, name }, options);
    } else {
      await authClient.signIn.email({ email, password }, options);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-card p-10 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 scale-125">
          <Logo showText={false} />
        </div>
        <h2 className="text-3xl font-bold tracking-tighter text-foreground">
          {isSignUp ? t("signUpTitle") : t("signInTitle")}
        </h2>
        <p className="text-sm text-muted-foreground mt-3 font-light tracking-wide">
          {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@agency.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center bg-primary px-3 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSignUp ? (
            t("signUpButton")
          ) : (
            t("signInButton")
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? t("hasAccount") : t("noAccount")}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          {isSignUp ? tc("login") : tc("startFreeTrial")}
        </Link>
      </p>
    </div>
  );
}
