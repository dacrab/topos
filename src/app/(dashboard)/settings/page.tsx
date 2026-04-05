import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SettingsPageSection } from "@/components/ui/page";
import { teamMember, user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export default async function ProfileSettingsPage() {
  const t = await getTranslations("Settings");
  const session = await getSession();
  if (!session) return null;

  const tenant = await getCurrentTenant();

  const [[currentUser], [member]] = await Promise.all([
    db.select().from(user).where(eq(user.id, session.user.id)).limit(1),
    db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.userId, session.user.id), eq(teamMember.tenantId, tenant.id)))
      .limit(1),
  ]);

  if (!currentUser) return null;

  return (
    <SettingsPageSection title={t("profile")} description={t("profileDesc")}>
      <ProfileForm currentUser={{ ...currentUser, teamRole: member?.role ?? null }} />
    </SettingsPageSection>
  );
}
