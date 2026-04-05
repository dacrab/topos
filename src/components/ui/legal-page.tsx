import { getTranslations } from "next-intl/server";

type LegalPageProps = {
  titleKey: string;
  subtitleKey: string;
  introKey: string;
  sections: { titleKey: string; descKey: string }[];
};

export async function LegalPage({ titleKey, subtitleKey, introKey, sections }: LegalPageProps) {
  const t = await getTranslations("Pages");

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">{t(titleKey)}</h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            {t(subtitleKey)}
          </p>
        </div>
        <div className="space-y-8">
          <div className="border border-border p-8">
            <p className="text-muted-foreground leading-relaxed">{t(introKey)}</p>
          </div>
          {sections.map(({ titleKey: tk, descKey: dk }) => (
            <div key={tk} className="border border-border p-8">
              <h2 className="text-xl font-bold mb-4">{t(tk)}</h2>
              <p className="text-muted-foreground leading-relaxed">{t(dk)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
