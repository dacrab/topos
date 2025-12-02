import { Mail, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ContactPage() {
  const t = await getTranslations("Pages");

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            {t("contactTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t("contactSubtitle")}
          </p>
        </div>

        <div className="border border-border p-8 bg-background mb-8">
          <p className="text-muted-foreground leading-relaxed text-center">
            {t("contactDesc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-border p-8 bg-background">
            <Mail className="w-8 h-8 mb-4 text-muted-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-muted-foreground">
              {t("emailUs")}
            </h3>
            <a
              href="mailto:hello@aether.dev"
              className="text-lg font-bold hover:text-primary transition-colors"
            >
              hello@aether.dev
            </a>
          </div>

          <div className="border border-border p-8 bg-background">
            <MapPin className="w-8 h-8 mb-4 text-muted-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-muted-foreground">
              {t("location")}
            </h3>
            <p className="text-lg font-bold">{t("locationValue")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
