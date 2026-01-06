"use client";

import { useTranslations } from "next-intl";
import { updateCompany } from "@/app/(dashboard)/settings/actions";
import {
  Button,
  FormField,
  FormGrid,
  FormSection,
  InfoBox,
  Input,
  Textarea,
} from "@/components/ui";
import { useFormAction } from "@/hooks/useFormAction";
import { APP_CONFIG } from "@/lib/config";
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
  const { isPending, execute } = useFormAction();
  const branding = tenant.branding || {};

  return (
    <form action={execute(updateCompany)} className="space-y-8 max-w-xl">
      <FormSection title={t("basicInfo")}>
        <FormField id="name" label={t("companyName")}>
          <Input
            id="name"
            name="name"
            defaultValue={tenant.name}
            placeholder={t("companyPlaceholder")}
          />
        </FormField>

        <FormField id="slug" label={t("subdomain")}>
          <div className="flex items-center">
            <Input
              id="slug"
              name="slug"
              defaultValue={tenant.slug}
              placeholder="acme"
            />
            <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
              .{APP_CONFIG.domain.replace(/:\d+$/, "")}
            </span>
          </div>
        </FormField>

        <FormField
          id="customDomain"
          label={t("customDomain")}
          hint={t("customDomainHint")}
        >
          <Input
            id="customDomain"
            name="customDomain"
            defaultValue={tenant.customDomain ?? ""}
            placeholder={t("customDomainPlaceholder")}
          />
        </FormField>

        <FormField id="description" label={t("companyDescription")}>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={branding.description ?? ""}
            placeholder={t("descriptionPlaceholder")}
          />
        </FormField>
      </FormSection>

      <FormSection title={t("contactInfo")}>
        <FormGrid>
          <FormField id="phone" label={t("phone")}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={branding.phone ?? ""}
              placeholder={t("phonePlaceholder")}
            />
          </FormField>
          <FormField id="companyEmail" label={t("email")}>
            <Input
              id="companyEmail"
              name="companyEmail"
              type="email"
              defaultValue={branding.email ?? ""}
              placeholder={t("emailPlaceholder")}
            />
          </FormField>
        </FormGrid>

        <FormField id="website" label={t("website")}>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={branding.website ?? ""}
            placeholder={t("websitePlaceholder")}
          />
        </FormField>

        <FormField id="address" label={t("address")}>
          <Textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={branding.address ?? ""}
            placeholder={t("addressPlaceholder")}
          />
        </FormField>
      </FormSection>

      <FormSection title={t("socialMedia")}>
        <FormGrid>
          <FormField id="socialFacebook" label={t("facebook")}>
            <Input
              id="socialFacebook"
              name="socialFacebook"
              type="url"
              defaultValue={branding.socialFacebook ?? ""}
              placeholder="https://facebook.com/..."
            />
          </FormField>
          <FormField id="socialInstagram" label={t("instagram")}>
            <Input
              id="socialInstagram"
              name="socialInstagram"
              type="url"
              defaultValue={branding.socialInstagram ?? ""}
              placeholder="https://instagram.com/..."
            />
          </FormField>
          <FormField id="socialTwitter" label={t("twitter")}>
            <Input
              id="socialTwitter"
              name="socialTwitter"
              type="url"
              defaultValue={branding.socialTwitter ?? ""}
              placeholder="https://twitter.com/..."
            />
          </FormField>
          <FormField id="socialLinkedin" label={t("linkedin")}>
            <Input
              id="socialLinkedin"
              name="socialLinkedin"
              type="url"
              defaultValue={branding.socialLinkedin ?? ""}
              placeholder="https://linkedin.com/company/..."
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <InfoBox title={t("tenantInfo")}>
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
      </InfoBox>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
