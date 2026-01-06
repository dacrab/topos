"use client";

import { useTranslations } from "next-intl";
import { updateNotifications } from "@/app/(dashboard)/settings/actions";
import { Button, FormSection, InfoBox, ToggleItem } from "@/components/ui";
import { useFormAction } from "@/hooks/useFormAction";
import type { NotificationSettings } from "@/lib/types";

type NotificationsFormProps = {
  settings: NotificationSettings;
  userEmail: string;
  tenantName: string;
};

export function NotificationsForm({
  settings,
  userEmail,
  tenantName,
}: NotificationsFormProps) {
  const t = useTranslations("Notifications");
  const { isPending, execute } = useFormAction();

  return (
    <form action={execute(updateNotifications)} className="space-y-8 max-w-xl">
      <FormSection title={t("emailNotifications")}>
        <p className="text-xs text-muted-foreground">
          {t("emailSentTo", { email: userEmail })}
        </p>
        <div className="space-y-3">
          <ToggleItem
            name="emailNewLead"
            label={t("newLead")}
            description={t("newLeadDesc")}
            defaultChecked={settings.emailNewLead}
          />
          <ToggleItem
            name="emailNewOffer"
            label={t("newOffer")}
            description={t("newOfferDesc")}
            defaultChecked={settings.emailNewOffer}
          />
          <ToggleItem
            name="emailListingUpdate"
            label={t("listingUpdates")}
            description={t("listingUpdatesDesc")}
            defaultChecked={settings.emailListingUpdate}
          />
          <ToggleItem
            name="emailWeeklyDigest"
            label={t("weeklyDigest")}
            description={t("weeklyDigestDesc")}
            defaultChecked={settings.emailWeeklyDigest}
          />
        </div>
      </FormSection>

      <FormSection title={t("pushNotifications")}>
        <p className="text-xs text-muted-foreground">{t("pushDesc")}</p>
        <div className="space-y-3">
          <ToggleItem
            name="pushNewLead"
            label={t("newLead")}
            description={t("pushNewLeadDesc")}
            defaultChecked={settings.pushNewLead}
          />
          <ToggleItem
            name="pushNewOffer"
            label={t("newOffer")}
            description={t("pushNewOfferDesc")}
            defaultChecked={settings.pushNewOffer}
          />
          <ToggleItem
            name="pushListingUpdate"
            label={t("listingUpdates")}
            description={t("pushListingUpdatesDesc")}
            defaultChecked={settings.pushListingUpdate}
          />
        </div>
      </FormSection>

      <FormSection title={t("marketingUpdates")}>
        <ToggleItem
          name="marketingEmails"
          label={t("marketingEmails")}
          description={t("marketingEmailsDesc")}
          defaultChecked={settings.marketingEmails}
        />
      </FormSection>

      <InfoBox title={t("notificationScope")}>
        <p className="text-sm text-muted-foreground">
          {t("scopeDesc")}{" "}
          <span className="font-medium text-foreground">{tenantName}</span>
        </p>
      </InfoBox>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("savePreferences")}
      </Button>
    </form>
  );
}
