import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("Pages");

  const sections = [
    { titleKey: "acceptableUse", descKey: "acceptableUseDesc" },
    { titleKey: "accountTerms", descKey: "accountTermsDesc" },
    { titleKey: "liability", descKey: "liabilityDesc" },
  ];

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            {t("termsTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t("termsSubtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <div className="border border-border p-8 bg-background">
            <p className="text-muted-foreground leading-relaxed">
              {t("termsIntro")}
            </p>
          </div>

          {sections.map(({ titleKey, descKey }) => (
            <div
              key={titleKey}
              className="border border-border p-8 bg-background"
            >
              <h2 className="text-xl font-bold mb-4">{t(titleKey)}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          ))}

          <p className="text-xs text-muted-foreground text-center">
            {t("lastUpdated")}: 2024-12-01
          </p>
        </div>
      </div>
    </div>
  );
}
