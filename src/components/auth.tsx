"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/ui/top-bar";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const handleSignIn = async (email: string, password: string) => {
    if (!signIn) return;
    const { error: createError } = await signIn.create({ identifier: email, password });
    if (createError) {
      setError(createError.message);
      return;
    }
    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setError(finalizeError.message);
        return;
      }
      toast.success(tc("signedInSuccess"));
      router.push("/dashboard");
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    if (!signUp) return;
    const { error: createError } = await signUp.create({
      emailAddress: email,
      password,
      firstName: name,
    });
    if (createError) {
      setError(createError.message);
      return;
    }
    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setError(finalizeError.message);
        return;
      }
      toast.success(tc("signedUpSuccess"));
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = form.get("email")?.toString() ?? "";
    const password = form.get("password")?.toString() ?? "";

    try {
      if (mode === "sign-in") {
        await handleSignIn(email, password);
      } else {
        const name = form.get("name")?.toString() ?? "";
        await handleSignUp(email, password, name);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("passwordMismatch"));
    } finally {
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
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {mode === "sign-in" ? t("signInTitle") : t("signUpTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "sign-in" ? t("signInSubtitle") : t("signUpSubtitle")}
        </p>
      </div>

      <div className="border border-border/40 bg-card shadow-card rounded-2xl overflow-hidden">
        <TopBar />
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "sign-up" && (
              <div>
                <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1.5">
                  {t("nameLabel")}
                </label>
                <Input id="name" name="name" placeholder={t("namePlaceholder")} required />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1.5">
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
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground block mb-1.5"
              >
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
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={loading || !signIn || !signUp}
            >
              {loading ? "..." : mode === "sign-in" ? t("signInButton") : t("signUpButton")}
            </Button>
          </form>

          <div className="mt-6 mb-4">
            <Compass className="w-3 h-3 text-muted-foreground/20" />
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? t("noAccount") : t("hasAccount")}{" "}
        <a href={oppositeHref} className="text-primary font-medium hover:underline">
          {oppositeLabel}
        </a>
      </p>
    </div>
  );
}
