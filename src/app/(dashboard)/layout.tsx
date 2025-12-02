import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";
import { activity } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import {
  createListing,
  dismissActivity,
  dismissAllActivities,
} from "./actions";

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const tenant = await getCurrentTenant();
  const activities = await getRecentActivities(tenant.id);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader
            tenantName={tenant.name}
            activities={activities}
            createListing={createListing}
            dismissActivity={dismissActivity}
            dismissAllActivities={dismissAllActivities}
          />

          {/* Main Content Area - Strict Grid */}
          <main className="flex-1 overflow-auto bg-background p-0 relative">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative min-h-full p-8 max-w-[1920px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
