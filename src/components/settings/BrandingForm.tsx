"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateBranding } from "@/app/(dashboard)/settings/actions";
import { Button, FormField, ImageUploadField, Input } from "@/components/ui";
import { useImageUpload } from "@/hooks/useImageUpload";

type BrandingFormProps = {
  tenant: {
    name: string;
    logoUrl: string | null;
    branding: Record<string, string> | null;
  };
};

export function BrandingForm({ tenant }: BrandingFormProps) {
  const t = useTranslations("Branding");
  const [isPending, startTransition] = useTransition();
  const logo = useImageUpload({
    initialUrl: tenant.logoUrl,
    uploadType: "logo",
  });
  const branding = tenant.branding || {};

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        formData.set("logoUrl", await logo.upload());
        const result = await updateBranding(formData);
        toast[result.success ? "success" : "error"](result.message);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("uploadFailed"));
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        <FormField id="name" label={t("agencyName")}>
          <Input
            id="name"
            name="name"
            defaultValue={tenant.name}
            placeholder={t("agencyPlaceholder")}
          />
        </FormField>

        <FormField label={t("logo")}>
          <ImageUploadField
            image={logo}
            label={t("selectLogo")}
            hint={t("logoHint")}
            size="sm"
            disabled={isPending}
          />
        </FormField>

        <FormField id="primary" label={t("primaryColor")}>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border"
              style={{
                background: branding.primary ?? "hsl(var(--primary, 222.2 47.4% 11.2%))",
              }}
            />
            <Input
              id="primary"
              name="primary"
              className="flex-1"
              defaultValue={branding.primary ?? ""}
              placeholder={t("primaryPlaceholder")}
            />
          </div>
        </FormField>

        <FormField id="accent" label={t("accentColor")}>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border"
              style={{
                background: branding.accent ?? "hsl(var(--accent, 210 40% 96.1%))",
              }}
            />
            <Input
              id="accent"
              name="accent"
              className="flex-1"
              defaultValue={branding.accent ?? ""}
              placeholder={t("accentPlaceholder")}
            />
          </div>
        </FormField>

        <FormField id="radius" label={t("borderRadius")} hint={t("radiusHint")}>
          <Input
            id="radius"
            name="radius"
            defaultValue={branding.radius ?? ""}
            placeholder={t("radiusPlaceholder")}
          />
        </FormField>
      </div>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
