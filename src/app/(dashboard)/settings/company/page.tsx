import { getTranslations } from "next-intl/server";
import { CompanyForm } from "@/components/settings/CompanyForm";
import { SettingsPageSection } from "@/components/ui/page";
import { getCurrentTenant } from "@/lib/currentTenant";
import type { TenantBranding } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  const t = await getTranslations("Settings");
  const tenant = await getCurrentTenant();
  const branding = (tenant.branding as TenantBranding | null) ?? {};

  return (
    <SettingsPageSection title={t("companyTitle")} description={t("companyDesc")}>
      <CompanyForm
        tenant={{
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          customDomain: tenant.customDomain,
          createdAt: tenant.createdAt,
          branding,
        }}
      />
    </SettingsPageSection>
  );
}
