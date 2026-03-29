import { getTranslations } from "next-intl/server";
import { BrandingForm } from "@/components/settings/BrandingForm";
import { SectionHeader } from "@/components/ui";
import { getCurrentTenant } from "@/lib/currentTenant";
import type { TenantBranding } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage() {
  const t = await getTranslations("Settings");
  const tenant = await getCurrentTenant();
  const branding = (tenant.branding as TenantBranding | null) ?? {};

  return (
    <div className="space-y-8 max-w-xl">
      <SectionHeader bordered title={t("brandingTitle")} description={t("brandingDesc")} />

      <BrandingForm
        tenant={{
          name: tenant.name,
          logoUrl: tenant.logoUrl,
          branding: branding as Record<string, string>,
        }}
      />
    </div>
  );
}
