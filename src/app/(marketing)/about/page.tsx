import { getTranslations } from "next-intl/server";
import { ContentCard, MarketingContainer, PageHeader } from "@/components/ui";

export default async function AboutPage() {
  const t = await getTranslations("Pages");

  return (
    <MarketingContainer>
      <PageHeader title={t("aboutTitle")} subtitle={t("aboutSubtitle")} />
      <div className="space-y-12">
        <ContentCard>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("aboutDesc")}</p>
        </ContentCard>
        <ContentCard inverted>
          <h2 className="text-2xl font-bold tracking-tight mb-4">{t("ourMission")}</h2>
          <p className="text-background/70 leading-relaxed">{t("missionDesc")}</p>
        </ContentCard>
      </div>
    </MarketingContainer>
  );
}
