"use client";

import { createAuthClient } from "better-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL });

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignUp = mode === "sign-up";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setIsLoading(false);
      return;
    }
    const options = {
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
    <div className="w-full max-w-md space-y-8 bg-card border border-border p-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6">
          <Logo showText={false} />
        </div>
        <h2 className="text-3xl font-bold tracking-tighter">
          {isSignUp ? t("signUpTitle") : t("signInTitle")}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20">
            {error}
          </div>
        )}
        {isSignUp && (
          <FormField id="name" label={t("nameLabel")}>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </FormField>
        )}
        <FormField id="email" label={t("emailLabel")}>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
          />
        </FormField>
        <FormField id="password" label={t("passwordLabel")}>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")}
          />
        </FormField>
        {isSignUp && (
          <FormField id="confirmPassword" label={t("confirmPasswordLabel")}>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
            />
          </FormField>
        )}
        <Button type="submit" disabled={isLoading} className="w-full py-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSignUp ? (
            t("signUpButton")
          ) : (
            t("signInButton")
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? t("hasAccount") : t("noAccount")}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-bold text-primary hover:underline"
        >
          {isSignUp ? tc("login") : tc("getStarted")}
        </Link>
      </p>
    </div>
  );
}
