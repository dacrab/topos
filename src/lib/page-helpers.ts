import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { getCurrentTenant } from "./currentTenant";

export async function requireDashboardAuth() {
  let session: Awaited<ReturnType<typeof getSession>>;
  try {
    session = await getSession();
  } catch {
    redirect("/sign-in");
  }
  if (!session) redirect("/sign-in");

  const tenant = await getCurrentTenant();
  return { session, tenant, userId: session.user.id, tenantId: tenant.id };
}
