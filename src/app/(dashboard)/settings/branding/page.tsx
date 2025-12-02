import { getTranslations } from "next-intl/server";
import { BrandingForm } from "@/components/settings/BrandingForm";
import { getCurrentTenant } from "@/lib/currentTenant";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage() {
  const t = await getTranslations("Settings");
  const tenant = await getCurrentTenant();
  const branding = (tenant.branding as Record<string, string> | null) || {};

  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("brandingTitle")}
        </h1>
        <p className="text-muted-foreground font-light">{t("brandingDesc")}</p>
      </div>

      <BrandingForm
        tenant={{
          name: tenant.name,
          logoUrl: tenant.logoUrl,
          branding,
        }}
      />
    </div>
  );
}
