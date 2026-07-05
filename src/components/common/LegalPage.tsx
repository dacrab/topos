import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TopBar } from "@/components/ui/top-bar";

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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 bg-primary/[0.04] rounded-full eyebrow-caps mb-4">
            <FileText className="w-3 h-3" />
            {t(subtitleKey)}
          </div>
          <h1 className="font-display text-heading-1 md:text-hero-2 font-semibold tracking-tight leading-display">
            {t(titleKey)}
          </h1>
          <div className="mt-8 max-w-[200px] mx-auto" />
        </div>

        <div className="border border-border/40 bg-card shadow-card rounded-3xl overflow-hidden">
          {/* Top accent */}
          <TopBar />

          <div className="bg-background p-8 md:p-10">
            <p className="text-muted-foreground leading-relaxed">{t(introKey)}</p>
          </div>
          <div className="divide-y divide-border/30">
            {sections.map(({ titleKey: tk, descKey: dk }) => (
              <div key={tk} className="bg-background p-8 md:p-10">
                <h2 className="font-display font-semibold text-lg tracking-tight mb-3 text-foreground">
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
