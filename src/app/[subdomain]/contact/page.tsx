import { Mail, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getTenant } from "@/lib/getTenant";
import type { TenantBranding } from "@/lib/types";

export default async function ContactPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const t = await getTranslations("Tenant");
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  if (!tenant) notFound();

  const branding: TenantBranding = tenant.branding ?? {};
  const hasDetails = Boolean(branding.email || branding.phone || branding.address);

  return (
    <div className="shell-wide py-14 md:py-20">
      <div className="grid gap-10 border-b-2 border-foreground/85 pb-10 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-7 lg:pr-10">
          <p className="chip-eyebrow mb-7">
            <Mail className="h-3 w-3" />
            {t("contactUs")}
          </p>
          <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-normal leading-[0.96] tracking-[-0.04em]">
            {tenant.name}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {branding.description || t("footerDesc")}
          </p>

          {branding.website && (
            <a
              href={branding.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-md mt-8"
            >
              {branding.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
          <p className="mb-4 meta-caps text-muted-foreground">{t("visitUs")}</p>
          <div className="border-t-2 border-foreground/85">
            {branding.email && (
              <a
                href={`mailto:${branding.email}`}
                className="group flex items-start gap-4 border-b border-border py-5 transition-colors hover:text-accent"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-accent transition-colors group-hover:border-accent">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="micro-caps text-muted-foreground">{t("emailUs")}</p>
                  <p className="mt-1 truncate text-sm">{branding.email}</p>
                </div>
              </a>
            )}
            {branding.phone && (
              <a
                href={`tel:${branding.phone}`}
                className="group flex items-start gap-4 border-b border-border py-5 transition-colors hover:text-accent"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-accent transition-colors group-hover:border-accent">
                  <Phone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="micro-caps text-muted-foreground">{t("callUs")}</p>
                  <p className="mt-1 text-sm">{branding.phone}</p>
                </div>
              </a>
            )}
            {branding.address && (
              <div className="flex items-start gap-4 border-b border-border py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-accent">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="micro-caps text-muted-foreground">{t("visitUs")}</p>
                  <p className="mt-1 whitespace-pre-line text-sm">{branding.address}</p>
                </div>
              </div>
            )}
            {!hasDetails && (
              <p className="border-b border-border py-8 text-center text-sm text-muted-foreground">
                {t("noContactInfo")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
