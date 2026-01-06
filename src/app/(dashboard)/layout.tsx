import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { activity } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

async function getRecentActivities(tenantId: string) {
  return db.query.activity.findMany({
    where: eq(activity.tenantId, tenantId),
    orderBy: desc(activity.createdAt),
    limit: 5,
  });
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const tenant = await getCurrentTenant();
  if (!tenant.onboardingCompleted && tenant.slug !== "demo") {
    redirect("/onboarding");
  }

  const activities = await getRecentActivities(tenant.id);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader tenantName={tenant.name} activities={activities} />
          <main className="flex-1 overflow-auto bg-background p-0 relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative min-h-full p-8 max-w-[1920px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
