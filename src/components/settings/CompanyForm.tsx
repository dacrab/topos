"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateCompany } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TenantBranding } from "@/lib/types";

type CompanyFormProps = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    customDomain: string | null;
    createdAt: Date;
    branding: TenantBranding | null;
  };
};

export function CompanyForm({ tenant }: CompanyFormProps) {
  const t = useTranslations("Company");
  const [isPending, startTransition] = useTransition();
  const branding = tenant.branding || {};

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateCompany(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-xl">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("basicInfo")}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="name">{t("companyName")}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={tenant.name}
            placeholder={t("companyPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">{t("subdomain")}</Label>
          <div className="flex items-center">
            <Input
              id="slug"
              name="slug"
              type="text"
              defaultValue={tenant.slug}
              placeholder="acme"
            />
            <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
              .aether.com
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customDomain">{t("customDomain")}</Label>
          <Input
            id="customDomain"
            name="customDomain"
            type="text"
            defaultValue={tenant.customDomain ?? ""}
            placeholder={t("customDomainPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">
            {t("customDomainHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t("companyDescription")}</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={branding.description ?? ""}
            placeholder={t("descriptionPlaceholder")}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("contactInfo")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={branding.phone ?? ""}
              placeholder={t("phonePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyEmail">{t("email")}</Label>
            <Input
              id="companyEmail"
              name="companyEmail"
              type="email"
              defaultValue={branding.email ?? ""}
              placeholder={t("emailPlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">{t("website")}</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={branding.website ?? ""}
            placeholder={t("websitePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{t("address")}</Label>
          <Textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={branding.address ?? ""}
            placeholder={t("addressPlaceholder")}
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("socialMedia")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="socialFacebook">{t("facebook")}</Label>
            <Input
              id="socialFacebook"
              name="socialFacebook"
              type="url"
              defaultValue={branding.socialFacebook ?? ""}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialInstagram">{t("instagram")}</Label>
            <Input
              id="socialInstagram"
              name="socialInstagram"
              type="url"
              defaultValue={branding.socialInstagram ?? ""}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialTwitter">{t("twitter")}</Label>
            <Input
              id="socialTwitter"
              name="socialTwitter"
              type="url"
              defaultValue={branding.socialTwitter ?? ""}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialLinkedin">{t("linkedin")}</Label>
            <Input
              id="socialLinkedin"
              name="socialLinkedin"
              type="url"
              defaultValue={branding.socialLinkedin ?? ""}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="border border-border p-4 space-y-3 bg-secondary/30">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("tenantInfo")}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t("tenantId")}</span>
            <p className="font-mono text-xs truncate">{tenant.id}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("created")}</span>
            <p className="font-mono">{tenant.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
