import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
import { SectionHeader } from "@/components/ui/page";
import { user } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import type { NotificationSettings } from "@/lib/types";

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNewLead: true,
  emailNewOffer: true,
  emailListingUpdate: true,
  emailWeeklyDigest: false,
  marketingEmails: false,
};

export default async function NotificationsSettingsPage() {
  const t = await getTranslations("Settings");
  const { userId, tenant } = await requireTenant();

  const [existingSettings] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  const settings: NotificationSettings = {
    ...DEFAULT_NOTIFICATIONS,
    ...((existingSettings?.notifications ?? {}) as Partial<NotificationSettings>),
  };

  return (
    <>
      <SectionHeader title={t("notificationsTitle")} description={t("notificationsDesc")} />
      <NotificationsForm
        settings={settings}
        userEmail={existingSettings?.email ?? ""}
        tenantName={tenant.name}
      />
    </>
  );
}
