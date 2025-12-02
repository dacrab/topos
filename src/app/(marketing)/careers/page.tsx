import { Briefcase } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CareersPage() {
  const t = await getTranslations("Pages");

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            {t("careersTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t("careersSubtitle")}
          </p>
        </div>

        <div className="border border-border p-12 bg-background text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">{t("noOpenings")}</h3>
          <p className="text-muted-foreground">{t("checkBack")}</p>
        </div>
      </div>
    </div>
  );
}
