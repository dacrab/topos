import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { getSession } from "@/lib/auth";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center p-6">{children}</main>
    </div>
  );
}
