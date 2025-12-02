import { getTranslations } from "next-intl/server";
import { CompanyForm } from "@/components/settings/CompanyForm";
import { getCurrentTenant } from "@/lib/currentTenant";

export const dynamic = "force-dynamic";

type TenantBranding = {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
};

export default async function CompanySettingsPage() {
  const t = await getTranslations("Settings");
  const currentTenant = await getCurrentTenant();
  const branding = (currentTenant.branding as TenantBranding | null) || {};

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">
          {t("companyTitle")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("companyDesc")}</p>
      </div>

      <CompanyForm
        tenant={{
          id: currentTenant.id,
          name: currentTenant.name,
          slug: currentTenant.slug,
          customDomain: currentTenant.customDomain,
          createdAt: currentTenant.createdAt,
          branding,
        }}
      />
    </div>
  );
}
