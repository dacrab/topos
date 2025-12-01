import { BrandingForm } from "@/components/settings/BrandingForm";
import { getCurrentTenant } from "@/lib/currentTenant";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage() {
  const tenant = await getCurrentTenant();
  const branding = (tenant.branding as Record<string, string> | null) || {};

  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Branding Settings
        </h1>
        <p className="text-muted-foreground font-light">
          Customize how your public site looks for visitors.
        </p>
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
