import { LegalPage } from "@/components/ui/legal-page";

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
