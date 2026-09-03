import { FileText } from "lucide-react";
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
      <div className="shell max-w-3xl">
        <div className="mb-12">
          <div className="chip-eyebrow mb-5">
            <FileText className="w-3 h-3" />
            {t(subtitleKey)}
          </div>
          <h1 className="font-display text-heading-1 md:text-hero-2 font-medium tracking-tight leading-display">
            {t(titleKey)}
          </h1>
        </div>

        <div className="card-base overflow-hidden">
          <div className="p-8 md:p-10 border-b border-border">
            <p className="text-muted-foreground leading-relaxed">{t(introKey)}</p>
          </div>
          <div className="divide-y divide-border">
            {sections.map(({ titleKey: tk, descKey: dk }) => (
              <div key={tk} className="p-8 md:p-10">
                <h2 className="font-semibold text-lg tracking-tight mb-3 text-foreground">
                  {t(tk)}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{t(dk)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
