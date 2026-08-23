import { Mail, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CardStripe } from "@/components/ui/stripe";
import { getTenant } from "@/lib/getTenant";
import type { TenantBranding } from "@/lib/types";

export default async function ContactPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const t = await getTranslations("Tenant");
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  if (!tenant) notFound();

  const branding: TenantBranding = tenant.branding ?? {};

  return (
    <div className="container mx-auto px-8 max-w-3xl py-24">
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        {t("contactUs")}
      </h1>
      {branding.description ? (
        <p className="text-muted-foreground mb-12 max-w-xl">{branding.description}</p>
      ) : (
        <p className="text-muted-foreground mb-12 max-w-xl">{t("footerDesc")}</p>
      )}

      <div className="border border-border/40 bg-card shadow-card rounded-2xl overflow-hidden">
        <CardStripe intensity="subtle" />
        <div className="divide-y divide-border/30">
          {branding.email && (
            <a
              href={`mailto:${branding.email}`}
              className="flex items-center gap-4 p-6 hover:bg-muted/30 transition-colors"
            >
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("emailUs")}</p>
                <p className="font-medium">{branding.email}</p>
              </div>
            </a>
          )}
          {branding.phone && (
            <a
              href={`tel:${branding.phone}`}
              className="flex items-center gap-4 p-6 hover:bg-muted/30 transition-colors"
            >
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("callUs")}</p>
                <p className="font-medium">{branding.phone}</p>
              </div>
            </a>
          )}
          {branding.address && (
            <div className="flex items-center gap-4 p-6">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("visitUs")}</p>
                <p className="font-medium whitespace-pre-line">{branding.address}</p>
              </div>
            </div>
          )}
          {!(branding.email || branding.phone || branding.address) && (
            <p className="p-8 text-sm text-muted-foreground text-center">{t("noProperties")}</p>
          )}
        </div>
      </div>

      {branding.website && (
        <a
          href={branding.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center mt-8 bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
        >
          {t("visitUs")}
        </a>
      )}
    </div>
  );
}
