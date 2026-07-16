import { getTranslations } from "next-intl/server";
import { BrandingForm } from "@/components/settings/BrandingForm";
import { SectionHeader } from "@/components/ui/page";
import { requireDashboardAuth } from "@/lib/page-helpers";
import type { TenantBranding } from "@/lib/types";

export default async function BrandingSettingsPage() {
  const t = await getTranslations("Settings");
  const { tenant } = await requireDashboardAuth();

  return (
    <div className="max-w-xl">
      <SectionHeader title={t("brandingTitle")} description={t("brandingDesc")} />
      <BrandingForm
        tenant={{
          name: tenant.name,
          logoUrl: tenant.logoUrl,
          branding: (tenant.branding ?? {}) as TenantBranding,
        }}
      />
    </div>
  );
}
