import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { invitation, tenant as tenantTable } from "@/db/schema";
import { db } from "@/lib/db";
import { acceptInvitation } from "./actions";

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
  const t = await getTranslations("Invite");
  const tc = await getTranslations("Common");
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

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md card-base text-center">
        <div className="p-8 space-y-4">
          <h1 className="page-title">{t("title")}</h1>
          {messageKey ? (
            <>
              <p className="text-muted-foreground">{messageKey}</p>
              <Link href="/dashboard" className="btn-primary btn-md">
                {tc("goToDashboard")}
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                {t("invitedTo", { tenant: tenantName })}{" "}
                <span className="font-medium text-foreground capitalize">{role}</span>
              </p>
              <form action={acceptInvitation.bind(null, id)}>
                <Button type="submit" variant="default" size="lg" className="w-full">
                  {t("accept")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
