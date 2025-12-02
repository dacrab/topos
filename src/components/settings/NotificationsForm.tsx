"use client";

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
          Email Notifications
        </h3>
        <p className="text-xs text-muted-foreground">
          Notifications will be sent to {userEmail}
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">New Lead</span>
              <p className="text-xs text-muted-foreground">
                When a new lead is created or inquiry received
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
              <span className="text-sm font-medium">New Offer</span>
              <p className="text-xs text-muted-foreground">
                When an offer is received on a listing
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
              <span className="text-sm font-medium">Listing Updates</span>
              <p className="text-xs text-muted-foreground">
                When a listing status changes
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
              <span className="text-sm font-medium">Weekly Digest</span>
              <p className="text-xs text-muted-foreground">
                A summary of your activity sent every Monday
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
          Push Notifications
        </h3>
        <p className="text-xs text-muted-foreground">
          Browser notifications (requires permission)
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium">New Lead</span>
              <p className="text-xs text-muted-foreground">
                Instant notification for new leads
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
              <span className="text-sm font-medium">New Offer</span>
              <p className="text-xs text-muted-foreground">
                Instant notification for offers
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
              <span className="text-sm font-medium">Listing Updates</span>
              <p className="text-xs text-muted-foreground">
                Notification when listings change
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
          Marketing & Updates
        </h3>

        <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
          <div>
            <span className="text-sm font-medium">Marketing Emails</span>
            <p className="text-xs text-muted-foreground">
              Product updates, tips, and promotional offers
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
          Notification Scope
        </h3>
        <p className="text-sm text-muted-foreground">
          These settings apply to notifications from{" "}
          <span className="font-medium text-foreground">{tenantName}</span>
        </p>
      </div>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  );
}
