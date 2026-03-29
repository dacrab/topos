import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SectionHeader } from "@/components/ui";
import { user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const t = await getTranslations("Settings");
  const session = await getSession();
  if (!session) return null;

  const [currentUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      <SectionHeader title={t("profile")} description={t("profileDesc")} bordered />
      <ProfileForm currentUser={currentUser} />
    </div>
  );
}
