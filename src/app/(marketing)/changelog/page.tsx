import { getTranslations } from "next-intl/server";

export default async function ChangelogPage() {
  const t = await getTranslations("Pages");
  const tc = await getTranslations("Changelog");

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            {t("changelogTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t("changelogSubtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <div className="border border-border p-8 bg-background">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-bold">v2.0.0</h3>
              <span className="text-xs font-mono text-muted-foreground">
                2024-12-01
              </span>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">+</span>
                {tc("multiTenantArch")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">+</span>
                {tc("customBrandingSupport")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">+</span>
                {tc("teamManagement")}
              </li>
            </ul>
          </div>

          <div className="border border-border p-8 bg-background">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-bold">v1.0.0</h3>
              <span className="text-xs font-mono text-muted-foreground">
                2024-10-01
              </span>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">+</span>
                {tc("initialRelease")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">+</span>
                {tc("listingManagement")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">+</span>
                {tc("contactManagement")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
