import { Briefcase } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContentCard, MarketingContainer, PageHeader } from "@/components/ui/page";

export default async function CareersPage() {
  const t = await getTranslations("Pages");

  return (
    <MarketingContainer>
      <PageHeader title={t("careersTitle")} subtitle={t("careersSubtitle")} />
      <ContentCard className="text-center p-12">
        <Briefcase className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">{t("noOpenings")}</h3>
        <p className="text-muted-foreground">{t("checkBack")}</p>
      </ContentCard>
    </MarketingContainer>
  );
}
