import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentTenant } from "./currentTenant";
import { deriveDisplayName } from "./utils";

export async function requireDashboardAuth() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [tenant, user] = await Promise.all([getCurrentTenant(userId), currentUser()]);
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const name = deriveDisplayName({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email,
  });

  return {
    userId,
    tenantId: tenant.id,
    tenant,
    session: { user: { id: userId, name, email } },
  };
}
