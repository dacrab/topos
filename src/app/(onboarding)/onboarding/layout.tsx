import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

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
