import { Globe, Layout, Lock, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContentCard, MarketingContainer, PageHeader } from "@/components/ui";

export default async function FeaturesPage() {
  const t = await getTranslations("Pages");
  const th = await getTranslations("HomePage");

  const features = [
    { icon: Globe, titleKey: "multiTenant", descKey: "multiTenantDesc" },
    { icon: Layout, titleKey: "customBranding", descKey: "customBrandingDesc" },
    { icon: Lock, titleKey: "security", descKey: "securityDesc" },
    { icon: Zap, titleKey: "performance", descKey: "performanceDesc" },
  ];

  return (
    <MarketingContainer maxWidth="max-w-6xl">
      <PageHeader title={t("featuresTitle")} subtitle={t("featuresSubtitle")} />
      <div className="grid md:grid-cols-2 gap-8">
        {features.map(({ icon: Icon, titleKey, descKey }) => (
          <ContentCard key={titleKey} className="hover:bg-secondary/30 transition-colors">
            <div className="w-12 h-12 mb-6 flex items-center justify-center border border-border">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wide mb-4">{th(titleKey)}</h3>
            <p className="text-muted-foreground leading-relaxed">{th(descKey)}</p>
          </ContentCard>
        ))}
      </div>
    </MarketingContainer>
  );
}
