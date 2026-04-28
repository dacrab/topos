import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SettingsPageSection } from "@/components/ui/page";
import { teamMember, user } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export default async function ProfileSettingsPage() {
  const t = await getTranslations("Settings");
  const { userId, tenantId } = await requireDashboardAuth();

  const [currentUser, member] = await Promise.all([
    db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)))
      .limit(1)
      .then((r) => r[0]),
  ]);

  if (!currentUser) return null;

  return (
    <SettingsPageSection title={t("profile")} description={t("profileDesc")}>
      <ProfileForm currentUser={{ ...currentUser, teamRole: member?.role ?? null }} />
    </SettingsPageSection>
  );
}
