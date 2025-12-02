"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateNotifications } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";

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
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateNotifications(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-xl">
      {/* Email Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("emailNotifications")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("emailSentTo", { email: userEmail })}
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">{t("newLead")}</span>
              <p className="text-xs text-muted-foreground">
                {t("newLeadDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              name="emailNewLead"
              defaultChecked={settings.emailNewLead}
              className="w-5 h-5 border-2 border-input bg-background"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">{t("newOffer")}</span>
              <p className="text-xs text-muted-foreground">
                {t("newOfferDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              name="emailNewOffer"
              defaultChecked={settings.emailNewOffer}
              className="w-5 h-5 border-2 border-input bg-background"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">{t("listingUpdates")}</span>
              <p className="text-xs text-muted-foreground">
                {t("listingUpdatesDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              name="emailListingUpdate"
              defaultChecked={settings.emailListingUpdate}
              className="w-5 h-5 border-2 border-input bg-background"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">{t("weeklyDigest")}</span>
              <p className="text-xs text-muted-foreground">
                {t("weeklyDigestDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              name="emailWeeklyDigest"
              defaultChecked={settings.emailWeeklyDigest}
              className="w-5 h-5 border-2 border-input bg-background"
            />
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("pushNotifications")}
        </h3>
        <p className="text-xs text-muted-foreground">{t("pushDesc")}</p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">{t("newLead")}</span>
              <p className="text-xs text-muted-foreground">
                {t("pushNewLeadDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              name="pushNewLead"
              defaultChecked={settings.pushNewLead}
              className="w-5 h-5 border-2 border-input bg-background"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">{t("newOffer")}</span>
              <p className="text-xs text-muted-foreground">
                {t("pushNewOfferDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              name="pushNewOffer"
              defaultChecked={settings.pushNewOffer}
              className="w-5 h-5 border-2 border-input bg-background"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">{t("listingUpdates")}</span>
              <p className="text-xs text-muted-foreground">
                {t("pushListingUpdatesDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              name="pushListingUpdate"
              defaultChecked={settings.pushListingUpdate}
              className="w-5 h-5 border-2 border-input bg-background"
            />
          </label>
        </div>
      </div>

      {/* Marketing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("marketingUpdates")}
        </h3>

        <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium">{t("marketingEmails")}</span>
            <p className="text-xs text-muted-foreground">
              {t("marketingEmailsDesc")}
            </p>
          </div>
          <input
            type="checkbox"
            name="marketingEmails"
            defaultChecked={settings.marketingEmails}
            className="w-5 h-5 border-2 border-input bg-background"
          />
        </label>
      </div>

      {/* Tenant Info */}
      <div className="border border-border p-4 space-y-2 bg-secondary/30">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("notificationScope")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("scopeDesc")}{" "}
          <span className="font-medium text-foreground">{tenantName}</span>
        </p>
      </div>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("savePreferences")}
      </Button>
    </form>
  );
}
