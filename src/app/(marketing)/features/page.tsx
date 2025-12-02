import { Globe, Layout, Lock, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";

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
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            {t("featuresTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="p-8 border border-border bg-background hover:bg-secondary/30 transition-colors"
            >
              <div className="w-12 h-12 mb-6 flex items-center justify-center border border-border">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-4">
                {th(titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {th(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
