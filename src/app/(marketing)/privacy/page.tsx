import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/common/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("privacyTitle") };
}

export default function PrivacyPage() {
  return (
    <LegalPage
      titleKey="privacyTitle"
      subtitleKey="privacySubtitle"
      introKey="privacyIntro"
      sections={[
        { titleKey: "dataCollection", descKey: "dataCollectionDesc" },
        { titleKey: "dataUsage", descKey: "dataUsageDesc" },
        { titleKey: "dataProtection", descKey: "dataProtectionDesc" },
      ]}
    />
  );
}
