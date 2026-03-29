import { getTranslations } from "next-intl/server";
import { CompanyForm } from "@/components/settings/CompanyForm";
import { SectionHeader } from "@/components/ui";
import { getCurrentTenant } from "@/lib/currentTenant";
import type { TenantBranding } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  const t = await getTranslations("Settings");
  const tenant = await getCurrentTenant();
  const branding = (tenant.branding as TenantBranding | null) ?? {};

  return (
    <div className="space-y-8">
      <SectionHeader title={t("companyTitle")} description={t("companyDesc")} bordered />
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
    </div>
  );
}
