import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentTenant } from "./currentTenant";

export async function requireDashboardAuth() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenant = await getCurrentTenant(userId);

  return {
    userId,
    tenantId: tenant.id,
    tenant,
  };
}
