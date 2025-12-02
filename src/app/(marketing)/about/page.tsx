import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("Pages");

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            {t("aboutTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t("aboutSubtitle")}
          </p>
        </div>

        <div className="space-y-12">
          <div className="border border-border p-8 bg-background">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("aboutDesc")}
            </p>
          </div>

          <div className="border border-border p-8 bg-foreground text-background">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              {t("ourMission")}
            </h2>
            <p className="text-background/70 leading-relaxed">
              {t("missionDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
