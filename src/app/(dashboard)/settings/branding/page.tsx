import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { tenant } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function updateBranding(formData: FormData) {
  "use server";

  const currentTenant = await getCurrentTenant();

  const name = formData.get("name")?.toString().trim() || currentTenant.name;
  const logoUrl = formData.get("logoUrl")?.toString().trim() || null;
  const primary = formData.get("primary")?.toString().trim() || "";
  const accent = formData.get("accent")?.toString().trim() || "";
  const radius = formData.get("radius")?.toString().trim() || "";

  const branding = {
    ...(currentTenant.branding as Record<string, unknown> | null | undefined),
    ...(primary ? { primary } : {}),
    ...(accent ? { accent } : {}),
    ...(radius ? { radius } : {}),
  };

  await db
    .update(tenant)
    .set({
      name,
      logoUrl,
      branding,
    })
    .where(eq(tenant.id, currentTenant.id));

  redirect("/settings/branding?updated=1");
}

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

      <form action={updateBranding} className="space-y-8">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Agency Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm placeholder:text-muted-foreground/50"
              defaultValue={tenant.name}
              placeholder="e.g. Acme Real Estate"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="logoUrl"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Logo URL
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              type="text"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm placeholder:text-muted-foreground/50"
              defaultValue={tenant.logoUrl ?? ""}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              In a real deployment this would be managed via UploadThing.
            </p>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="primary"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Primary Color (CSS value)
            </label>
            <div className="flex gap-2 items-center">
              <div
                className="w-10 h-10 border border-border"
                style={{
                  background:
                    branding.primary ??
                    "hsl(var(--primary, 222.2 47.4% 11.2%))",
                }}
              ></div>
              <input
                id="primary"
                name="primary"
                type="text"
                className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm placeholder:text-muted-foreground/50 flex-1"
                defaultValue={branding.primary ?? ""}
                placeholder="e.g. 222.2 84% 56.5% or #2563eb"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="accent"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Accent Color (CSS value)
            </label>
            <div className="flex gap-2 items-center">
              <div
                className="w-10 h-10 border border-border"
                style={{
                  background:
                    branding.accent ?? "hsl(var(--accent, 210 40% 96.1%))",
                }}
              ></div>
              <input
                id="accent"
                name="accent"
                type="text"
                className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm placeholder:text-muted-foreground/50 flex-1"
                defaultValue={branding.accent ?? ""}
                placeholder="e.g. 210 40% 96.1% or #f4f4ff"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="radius"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Border Radius
            </label>
            <input
              id="radius"
              name="radius"
              type="text"
              className="block w-full border border-input bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm placeholder:text-muted-foreground/50"
              defaultValue={branding.radius ?? ""}
              placeholder="e.g. 0.75rem"
            />
            <p className="text-xs text-muted-foreground">
              Applied to components via the <code>--radius</code> CSS variable.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-sm"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
