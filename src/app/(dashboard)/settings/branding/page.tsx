import { getTranslations } from "next-intl/server";
import { BrandingForm } from "@/components/settings/BrandingForm";
import { SettingsPageSection } from "@/components/ui/page";
import { getCurrentTenant } from "@/lib/currentTenant";
import type { TenantBranding } from "@/lib/types";

export default async function BrandingSettingsPage() {
  const t = await getTranslations("Settings");
  const tenant = await getCurrentTenant();

  return (
    <SettingsPageSection title={t("brandingTitle")} description={t("brandingDesc")} className="max-w-xl">
      <BrandingForm
        tenant={{
          name: tenant.name,
          logoUrl: tenant.logoUrl,
          branding: (tenant.branding as TenantBranding | null) ?? {} as Record<string, string>,
        }}
      />
    </SettingsPageSection>
  );
}
