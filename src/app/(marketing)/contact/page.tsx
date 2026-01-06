import { Mail, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContentCard, MarketingContainer, PageHeader } from "@/components/ui";
import { APP_CONFIG } from "@/lib/config";

export default async function ContactPage() {
  const t = await getTranslations("Pages");

  return (
    <MarketingContainer>
      <PageHeader title={t("contactTitle")} subtitle={t("contactSubtitle")} />
      <ContentCard className="mb-8 text-center">
        <p className="text-muted-foreground leading-relaxed">{t("contactDesc")}</p>
      </ContentCard>
      <div className="grid md:grid-cols-2 gap-8">
        <ContentCard>
          <Mail className="w-8 h-8 mb-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-muted-foreground">
            {t("emailUs")}
          </h3>
          <a
            href={`mailto:${APP_CONFIG.supportEmail}`}
            className="text-lg font-bold hover:text-primary transition-colors"
          >
            {APP_CONFIG.supportEmail}
          </a>
        </ContentCard>
        <ContentCard>
          <MapPin className="w-8 h-8 mb-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-muted-foreground">
            {t("location")}
          </h3>
          <p className="text-lg font-bold">{t("locationValue")}</p>
        </ContentCard>
      </div>
    </MarketingContainer>
  );
}
