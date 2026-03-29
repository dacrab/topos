import { getTranslations } from "next-intl/server";
import { MarketingContainer, PageHeader } from "@/components/ui";

const CHANGELOG = [
  {
    version: "v2.0.0",
    date: "2024-12-01",
    keys: ["multiTenantArch", "customBrandingSupport", "teamManagement"],
  },
  {
    version: "v1.0.0",
    date: "2024-10-01",
    keys: ["initialRelease", "listingManagement", "contactManagement"],
  },
];

export default async function ChangelogPage() {
  const t = await getTranslations("Pages");
  const tc = await getTranslations("Changelog");

  return (
    <MarketingContainer className="max-w-4xl">
      <PageHeader title={t("changelogTitle")} subtitle={t("changelogSubtitle")} />

      <div className="space-y-8">
        {CHANGELOG.map(({ version, date, keys }) => (
          <div key={version} className="border border-border p-8 bg-background">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-bold">{version}</h3>
              <span className="mono-caption">{date}</span>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              {keys.map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-primary">+</span>
                  {tc(key)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </MarketingContainer>
  );
}
