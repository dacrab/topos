import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { AcceptInvitationForm } from "@/components/invite/AcceptInvitationForm";
import { Badge } from "@/components/ui/badge";
import { invitation, tenant as tenantTable } from "@/db/schema";
import { isTeamRole } from "@/lib/config";
import { db } from "@/lib/db";

type InviteState = "ready" | "invalid" | "expired" | "mismatch";

async function resolveState(
  id: string,
  userEmail: string,
): Promise<{ state: InviteState; tenantName: string; role: string }> {
  const [inv] = await db.select().from(invitation).where(eq(invitation.id, id)).limit(1);
  if (inv?.status !== "pending") return { state: "invalid", tenantName: "", role: "" };
  if (inv.expiresAt.getTime() < Date.now()) return { state: "expired", tenantName: "", role: "" };

  const [tenantRow] = await db
    .select({ name: tenantTable.name })
    .from(tenantTable)
    .where(eq(tenantTable.id, inv.tenantId))
    .limit(1);

  if (userEmail && inv.email.toLowerCase() !== userEmail.toLowerCase())
    return { state: "mismatch", tenantName: "", role: "" };

  return {
    state: "ready",
    tenantName: tenantRow?.name ?? "",
    role: inv.role,
  };
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const [t, tc, tt] = await Promise.all([
    getTranslations("Invite"),
    getTranslations("Common"),
    getTranslations("Team"),
  ]);
  const { id } = await params;
  const { state: errorState } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/invite/${id}`)}`);

  let view: InviteState = errorState === "invalid" ? "invalid" : "ready";
  let tenantName = "";
  let role = "";

  if (!errorState) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
    const resolved = await resolveState(id, email);
    view = resolved.state;
    tenantName = resolved.tenantName;
    role = resolved.role;
  }

  const messageKey =
    view === "invalid"
      ? t("invalid")
      : view === "expired"
        ? t("expired")
        : view === "mismatch"
          ? t("mismatch")
          : null;

  const roleLabel = isTeamRole(role) ? tt(role) : role;

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="texture-grid pointer-events-none absolute inset-0 opacity-[0.16]" />
        <div className="pointer-events-none absolute -right-16 top-24 h-[420px] w-[420px] border border-primary-foreground/15" />
        <div className="pointer-events-none absolute -right-16 top-24 h-[420px] w-[420px] translate-x-6 translate-y-6 border border-primary-foreground/[0.07]" />

        <Link href="/" className="relative z-10 inline-flex" aria-label={tc("home")}>
          <Logo inverted />
        </Link>

        <div className="relative z-10 max-w-md space-y-5 border-l-2 border-accent pl-6">
          <p className="meta-caps text-primary-foreground/60">{t("asideEyebrow")}</p>
          <h1 className="font-display text-4xl leading-[1.02] tracking-[-0.03em]">
            {t("asideTitle")}
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/60">{t("asideDesc")}</p>
        </div>

        <p className="relative z-10 meta-caps text-primary-foreground/40">
          Topos · {tc("workspace")}
        </p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="lg:hidden" aria-label={tc("home")}>
            <Logo />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 border border-border px-3 py-1.5 meta-caps text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {tc("home")}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <div className="border-t-2 border-foreground/85 bg-card">
              <div className="border-b border-border px-6 py-6 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center border border-border text-accent">
                  {messageKey ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Mail className="h-5 w-5" />
                  )}
                </span>
                <h1 className="mt-4 card-title">{t("title")}</h1>
              </div>

              <div className="p-6 text-center">
                {messageKey ? (
                  <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">{messageKey}</p>
                    <Link href="/dashboard" className="btn-primary btn-md w-full">
                      {tc("goToDashboard")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t("invitedTo", { tenant: tenantName })}
                    </p>
                    <Badge variant="primary" className="px-2 py-1 text-xs">
                      {roleLabel}
                    </Badge>
                    <AcceptInvitationForm invitationId={id} label={t("accept")} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
