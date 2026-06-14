import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SectionHeader } from "@/components/ui/page";
import { teamMember, user } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Settings");
  return { title: t("title") };
}

export default async function ProfileSettingsPage() {
  const t = await getTranslations("Settings");
  const { userId, tenantId } = await requireDashboardAuth();

  const [currentUserRow, memberRow] = await Promise.all([
    db.select().from(user).where(eq(user.id, userId)).limit(1),
    db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)))
      .limit(1),
  ]);

  const currentUser = currentUserRow[0];
  const member = memberRow[0];

  if (!currentUser) return null;

  return (
    <>
      <SectionHeader title={t("profile")} description={t("profileDesc")} />
      <ProfileForm currentUser={{ ...currentUser, teamRole: member?.role ?? null }} />
    </>
  );
}
