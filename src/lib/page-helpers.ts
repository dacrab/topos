import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { getCurrentTenant } from "./currentTenant";

export async function requireDashboardAuth() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const tenant = await getCurrentTenant();
  return { session, tenant, userId: session.user.id, tenantId: tenant.id };
}
