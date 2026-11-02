import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/common/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("termsTitle") };
}

export default function TermsPage() {
  return (
    <LegalPage
      titleKey="termsTitle"
      subtitleKey="termsSubtitle"
      introKey="termsIntro"
      sections={[
        { titleKey: "acceptableUse", descKey: "acceptableUseDesc" },
        { titleKey: "accountTerms", descKey: "accountTermsDesc" },
        { titleKey: "liability", descKey: "liabilityDesc" },
      ]}
    />
  );
}
