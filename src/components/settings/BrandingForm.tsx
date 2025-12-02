"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateBranding } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BrandingFormProps = {
  tenant: {
    name: string;
    logoUrl: string | null;
    branding: Record<string, string> | null;
  };
};

export function BrandingForm({ tenant }: BrandingFormProps) {
  const [isPending, startTransition] = useTransition();
  const branding = tenant.branding || {};

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateBranding(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Agency Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={tenant.name}
            placeholder="e.g. Acme Real Estate"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="text"
            defaultValue={tenant.logoUrl ?? ""}
            placeholder="https://..."
          />
          <p className="text-xs text-muted-foreground">
            In a real deployment this would be managed via UploadThing.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="primary">Primary Color (CSS value)</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border"
              style={{
                background:
                  branding.primary ?? "hsl(var(--primary, 222.2 47.4% 11.2%))",
              }}
            />
            <Input
              id="primary"
              name="primary"
              type="text"
              className="flex-1"
              defaultValue={branding.primary ?? ""}
              placeholder="e.g. 222.2 84% 56.5% or #2563eb"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="accent">Accent Color (CSS value)</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border"
              style={{
                background:
                  branding.accent ?? "hsl(var(--accent, 210 40% 96.1%))",
              }}
            />
            <Input
              id="accent"
              name="accent"
              type="text"
              className="flex-1"
              defaultValue={branding.accent ?? ""}
              placeholder="e.g. 210 40% 96.1% or #f4f4ff"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="radius">Border Radius</Label>
          <Input
            id="radius"
            name="radius"
            type="text"
            defaultValue={branding.radius ?? ""}
            placeholder="e.g. 0.75rem"
          />
          <p className="text-xs text-muted-foreground">
            Applied to components via the <code>--radius</code> CSS variable.
          </p>
        </div>
      </div>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
