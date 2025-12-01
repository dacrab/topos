import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const tenant = await getCurrentTenant();

  // Fetch user's notification settings
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
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">
          Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how and when you receive notifications
        </p>
      </div>

      <NotificationsForm
        settings={settings}
        userEmail={session.user.email}
        tenantName={tenant.name}
      />
    </div>
  );
}
