"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL });

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      if (mode === "sign-in") {
        await authClient.signIn.email(
          { email, password },
          {
            onSuccess: () => {
              toast.success(tc("signedInSuccess"));
              router.push("/dashboard");
            },
            onError: (ctx) => {
              setError(ctx.error.message ?? t("passwordMismatch"));
              setLoading(false);
            },
          },
        );
      } else {
        const name = form.get("name") as string;
        await authClient.signUp.email(
          { email, password, name },
          {
            onSuccess: () => {
              toast.success(tc("signedUpSuccess"));
              router.push("/dashboard");
            },
            onError: (ctx) => {
              setError(ctx.error.message ?? t("passwordMismatch"));
              setLoading(false);
            },
          },
        );
      }
    } catch {
      setError(t("passwordMismatch"));
      setLoading(false);
    }
  };

  const oppositeHref = mode === "sign-in" ? "/sign-up" : "/sign-in";
  const oppositeLabel = mode === "sign-in" ? t("signUpButton") : t("signInButton");

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo showText={false} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          {mode === "sign-in" ? t("signInTitle") : t("signUpTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "sign-in" ? t("signInSubtitle") : t("signUpSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" && (
          <div>
            <label htmlFor="name" className="label-caps block mb-1.5">
              {t("nameLabel")}
            </label>
            <Input id="name" name="name" placeholder={t("namePlaceholder")} required />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label-caps block mb-1.5">
            {t("emailLabel")}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label-caps block mb-1.5">
            {t("passwordLabel")}
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            required
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="submit" className="w-full" disabled={loading}>
          {loading ? "..." : mode === "sign-in" ? t("signInButton") : t("signUpButton")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? t("noAccount") : t("hasAccount")}{" "}
        <a href={oppositeHref} className="text-foreground font-medium hover:underline">
          {oppositeLabel}
        </a>
      </p>
    </div>
  );
}
