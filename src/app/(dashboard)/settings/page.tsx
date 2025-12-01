import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information and profile picture
        </p>
      </div>

      <ProfileForm currentUser={currentUser} />
    </div>
  );
}
