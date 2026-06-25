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
    <div className="py-24 md:py-32">
      <div className="section-container max-w-3xl">
        <div className="mb-16">
          <p className="label-caps mb-3">{t(subtitleKey)}</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
            {t(titleKey)}
          </h1>
          <div className="divider-diamond mt-6" />
        </div>

        <div className="border border-border/40 rounded-2xl overflow-hidden shadow-card">
          <div className="h-2 bg-primary/5 arch-top" />
          <div className="bg-background p-8 md:p-10">
            <p className="text-muted-foreground leading-relaxed">{t(introKey)}</p>
          </div>
          <div className="divide-y divide-border/30">
            {sections.map(({ titleKey: tk, descKey: dk }) => (
              <div key={tk} className="bg-background p-8 md:p-10">
                <h2 className="font-display font-semibold text-lg tracking-tight mb-3">{t(tk)}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{t(dk)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
