import { LegalPage } from "@/components/ui/legal-page";

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
