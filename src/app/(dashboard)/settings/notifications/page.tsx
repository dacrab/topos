import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
import { SectionHeader } from "@/components/ui/page";
import { userSettings } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";
import type { NotificationSettings } from "@/lib/types";

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNewLead: true,
  emailNewOffer: true,
  emailListingUpdate: true,
  emailWeeklyDigest: false,
  pushNewLead: true,
  pushNewOffer: true,
  pushListingUpdate: false,
  marketingEmails: false,
};

export default async function NotificationsSettingsPage() {
  const t = await getTranslations("Settings");
  const { session, tenant } = await requireDashboardAuth();

  const [existingSettings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  const settings: NotificationSettings = {
    ...DEFAULT_NOTIFICATIONS,
    ...((existingSettings?.notifications as Partial<NotificationSettings>) ?? {}),
  };

  return (
    <>
      <SectionHeader title={t("notificationsTitle")} description={t("notificationsDesc")} />
      <NotificationsForm
        settings={settings}
        userEmail={session.user.email}
        tenantName={tenant.name}
      />
    </>
  );
}
