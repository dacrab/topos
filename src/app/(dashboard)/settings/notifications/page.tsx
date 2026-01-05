import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
import { SectionHeader } from "@/components/ui";
import { userSettings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type NotificationSettings = {
  emailNewLead: boolean;
  emailNewOffer: boolean;
  emailListingUpdate: boolean;
  emailWeeklyDigest: boolean;
  pushNewLead: boolean;
  pushNewOffer: boolean;
  pushListingUpdate: boolean;
  marketingEmails: boolean;
};

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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const tenant = await getCurrentTenant();
  const [existingSettings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  const settings: NotificationSettings = {
    ...DEFAULT_NOTIFICATIONS,
    ...((existingSettings?.notifications as Partial<NotificationSettings>) ||
      {}),
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title={t("notificationsTitle")}
        description={t("notificationsDesc")}
      />
      <NotificationsForm
        settings={settings}
        userEmail={session.user.email}
        tenantName={tenant.name}
      />
    </div>
  );
}
