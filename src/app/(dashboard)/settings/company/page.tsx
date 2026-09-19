import { getTranslations } from "next-intl/server";
import { CompanyForm } from "@/components/settings/CompanyForm";
import { SectionHeader } from "@/components/ui/page";
import { requireTenant } from "@/lib/action-wrapper";

export default async function CompanySettingsPage() {
  const t = await getTranslations("Settings");
  const { tenant } = await requireTenant();

  return (
    <>
      <SectionHeader title={t("companyTitle")} description={t("companyDesc")} />
      <CompanyForm
        tenant={{
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          customDomain: tenant.customDomain,
          createdAt: tenant.createdAt,
          branding: tenant.branding ?? {},
        }}
      />
    </>
  );
}
