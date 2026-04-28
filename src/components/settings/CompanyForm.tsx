"use client";

import { useTranslations } from "next-intl";
import { updateCompany } from "@/app/(dashboard)/settings/actions";
import { FormField, FormGrid, FormSubmitButton } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { FormSection, InfoBox } from "@/components/ui/page";
import { formatDate } from "@/lib/format";
import { useFormAction } from "@/hooks/useFormAction";
import { APP_CONFIG } from "@/lib/config";
import type { TenantBranding } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const branding = tenant.branding ?? {};

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
              placeholder={t("slugPlaceholder")}
            />
            <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
              .{APP_CONFIG.domain.replace(/:\d+$/, "")}
            </span>
          </div>
        </FormField>

        <FormField id="customDomain" label={t("customDomain")} hint={t("customDomainHint")}>
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
              placeholder={t("facebookPlaceholder")}
            />
          </FormField>
          <FormField id="socialInstagram" label={t("instagram")}>
            <Input
              id="socialInstagram"
              name="socialInstagram"
              type="url"
              defaultValue={branding.socialInstagram ?? ""}
              placeholder={t("instagramPlaceholder")}
            />
          </FormField>
          <FormField id="socialTwitter" label={t("twitter")}>
            <Input
              id="socialTwitter"
              name="socialTwitter"
              type="url"
              defaultValue={branding.socialTwitter ?? ""}
              placeholder={t("twitterPlaceholder")}
            />
          </FormField>
          <FormField id="socialLinkedin" label={t("linkedin")}>
            <Input
              id="socialLinkedin"
              name="socialLinkedin"
              type="url"
              defaultValue={branding.socialLinkedin ?? ""}
              placeholder={t("linkedinPlaceholder")}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <InfoBox title={t("tenantInfo")}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: t("tenantId"), value: tenant.id, mono: true },
            { label: t("created"), value: formatDate(tenant.createdAt) },
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <span className="text-muted-foreground">{label}</span>
              <p className={cn("font-mono", mono && "text-xs truncate")}>{value}</p>
            </div>
          ))}
        </div>
      </InfoBox>

      <FormSubmitButton
        isPending={isPending}
        pendingLabel={t("saving")}
        idleLabel={t("saveChanges")}
      />
    </form>
  );
}
