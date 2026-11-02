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
    <div>
      <div className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-0">
        <aside className="lg:col-span-3 lg:pr-10">
          <p className="chip-eyebrow">
            <FileText className="h-3 w-3" />
            {t(subtitleKey)}
          </p>

          <nav className="sticky top-24 mt-9 hidden flex-col border-t border-border lg:flex">
            {sections.map(({ titleKey: tk }, i) => (
              <a
                key={tk}
                href={`#section-${i + 1}`}
                className="group flex items-baseline gap-3 border-b border-border py-2.5 transition-colors"
              >
                <span className="font-mono text-micro tracking-caps text-muted-foreground/70 group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs leading-snug text-muted-foreground transition-colors group-hover:text-foreground">
                  {t(tk)}
                </span>
              </a>
            ))}
          </nav>
        </aside>

        <article className="lg:col-span-9 lg:border-l lg:border-border lg:pl-10">
          <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.035em]">
            {t(titleKey)}
          </h1>

          <p className="mt-7 max-w-2xl border-b border-border pb-9 text-base leading-relaxed text-muted-foreground">
            {t(introKey)}
          </p>

          <div>
            {sections.map(({ titleKey: tk, descKey: dk }, i) => (
              <section
                key={tk}
                id={`section-${i + 1}`}
                className="grid scroll-mt-24 gap-3 border-b border-border py-8 sm:grid-cols-[3rem_1fr] sm:gap-6"
              >
                <span className="index-caps">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="font-display text-xl tracking-[-0.01em] text-foreground">
                    {t(tk)}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {t(dk)}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
