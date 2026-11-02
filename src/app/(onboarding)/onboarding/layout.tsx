import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const t = await getTranslations("Onboarding");
  const points = [t("asidePoint1"), t("asidePoint2"), t("asidePoint3")];

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="texture-grid pointer-events-none absolute inset-0 opacity-[0.14]" />
        <div className="relative">
          <Logo inverted />
        </div>

        <div className="relative max-w-md space-y-6">
          <p className="meta-caps text-primary-foreground/60">{t("asideEyebrow")}</p>
          <h1 className="font-display text-4xl leading-[1.0] tracking-[-0.03em]">
            {t("asideTitle")}
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/70">{t("asideDesc")}</p>
          <ul className="border-t border-primary-foreground/20 pt-2">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 border-b border-primary-foreground/20 py-2.5 text-sm"
              >
                <span className="mt-[0.45rem] h-1 w-1 shrink-0 bg-accent" />
                <span className="text-primary-foreground/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative meta-caps text-primary-foreground/40">
          Topos · {t("progressLabel")}
        </p>
      </aside>

      <main className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center border-b border-border px-6 lg:hidden">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </main>
    </div>
  );
}
