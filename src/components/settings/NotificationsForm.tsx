"use client";

import { useTranslations } from "next-intl";
import { updateNotifications } from "@/app/(dashboard)/settings/actions";
import { FormSubmitButton, ToggleItem } from "@/components/ui/form";
import { FormSection, InfoBox } from "@/components/ui/page";
import { useFormAction } from "@/hooks/useFormAction";
import type { NotificationSettings } from "@/lib/types";

type NotificationsFormProps = {
  settings: NotificationSettings;
  userEmail: string;
  tenantName: string;
};

export function NotificationsForm({ settings, userEmail, tenantName }: NotificationsFormProps) {
  const t = useTranslations("Notifications");
  const { isPending, run } = useFormAction();

  return (
    <form action={run(updateNotifications)} className="space-y-8 max-w-xl">
      <FormSection title={t("emailNotifications")}>
        <p className="text-xs text-muted-foreground">{t("emailSentTo", { email: userEmail })}</p>
        <div className="space-y-3">
          <ToggleItem
            name="emailNewLead"
            label={t("newLead")}
            description={t("newLeadDesc")}
            defaultChecked={settings.emailNewLead ?? false}
          />
          <ToggleItem
            name="emailNewOffer"
            label={t("newOffer")}
            description={t("newOfferDesc")}
            defaultChecked={settings.emailNewOffer ?? false}
          />
          <ToggleItem
            name="emailListingUpdate"
            label={t("listingUpdates")}
            description={t("listingUpdatesDesc")}
            defaultChecked={settings.emailListingUpdate ?? false}
          />
          <ToggleItem
            name="emailWeeklyDigest"
            label={t("weeklyDigest")}
            description={t("weeklyDigestDesc")}
            defaultChecked={settings.emailWeeklyDigest ?? false}
          />
        </div>
      </FormSection>

      <FormSection title={t("marketingUpdates")}>
        <ToggleItem
          name="marketingEmails"
          label={t("marketingEmails")}
          description={t("marketingEmailsDesc")}
          defaultChecked={settings.marketingEmails ?? false}
        />
      </FormSection>

      <InfoBox title={t("notificationScope")}>
        <p className="text-sm text-muted-foreground">
          {t("scopeDesc")} <span className="font-medium text-foreground">{tenantName}</span>
        </p>
      </InfoBox>

      <FormSubmitButton
        isPending={isPending}
        pendingLabel={t("saving")}
        idleLabel={t("savePreferences")}
      />
    </form>
  );
}
