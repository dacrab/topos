import { getTranslations } from "next-intl/server";
import { ContentCard, MarketingContainer, PageHeader } from "@/components/ui";

type LegalPageProps = {
  titleKey: string;
  subtitleKey: string;
  introKey: string;
  sections: { titleKey: string; descKey: string }[];
};

export async function LegalPage({
  titleKey,
  subtitleKey,
  introKey,
  sections,
}: LegalPageProps) {
  const t = await getTranslations("Pages");

  return (
    <MarketingContainer>
      <PageHeader title={t(titleKey)} subtitle={t(subtitleKey)} />
      <div className="space-y-8">
        <ContentCard>
          <p className="text-muted-foreground leading-relaxed">{t(introKey)}</p>
        </ContentCard>
        {sections.map(({ titleKey: tk, descKey: dk }) => (
          <ContentCard key={tk}>
            <h2 className="text-xl font-bold mb-4">{t(tk)}</h2>
            <p className="text-muted-foreground leading-relaxed">{t(dk)}</p>
          </ContentCard>
        ))}
        <p className="text-xs text-muted-foreground text-center">
          {t("lastUpdated")}: 2024-12-01
        </p>
      </div>
    </MarketingContainer>
  );
}
