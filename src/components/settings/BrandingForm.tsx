"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateBranding } from "@/app/(dashboard)/settings/actions";
import { FormSubmitButton, Label } from "@/components/ui/form";
import { ImageUploadField } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { TenantBranding } from "@/lib/types";

type BrandingFormProps = {
  tenant: {
    name: string;
    logoUrl: string | null;
    branding: TenantBranding;
  };
};

export function BrandingForm({ tenant }: BrandingFormProps) {
  const t = useTranslations("Branding");
  const [isPending, startTransition] = useTransition();
  const logo = useImageUpload(tenant.logoUrl, "logo");
  const branding = tenant.branding;

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const logoUrl = await logo.upload();
      formData.set("logoUrl", logoUrl);
      const result = await updateBranding(formData);
      toast[result.success ? "success" : "error"](result.message);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t("agencyName")}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={tenant.name}
            placeholder={t("agencyPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("logo")}</Label>
          <ImageUploadField
            image={logo}
            label={t("selectLogo")}
            hint={t("logoHint")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary">{t("primaryColor")}</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border rounded-md"
              style={{ background: branding.primary ?? "hsl(var(--primary))" }}
            />
            <Input
              id="primary"
              name="primary"
              className="flex-1"
              defaultValue={branding.primary ?? ""}
              placeholder={t("primaryPlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accent">{t("accentColor")}</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border rounded-md"
              style={{ background: branding.accent ?? "hsl(var(--accent))" }}
            />
            <Input
              id="accent"
              name="accent"
              className="flex-1"
              defaultValue={branding.accent ?? ""}
              placeholder={t("accentPlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius">{t("borderRadius")}</Label>
          <Input
            id="radius"
            name="radius"
            defaultValue={branding.radius ?? ""}
            placeholder={t("radiusPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("radiusHint")}</p>
        </div>
      </div>

      <FormSubmitButton
        isPending={isPending}
        pendingLabel={t("saving")}
        idleLabel={t("saveChanges")}
      />
    </form>
  );
}
