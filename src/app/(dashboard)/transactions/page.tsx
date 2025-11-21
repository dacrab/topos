import { eq } from "drizzle-orm";
import { transactionPipeline } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const tenant = await getCurrentTenant();

  const pipelines = await db
    .select()
    .from(transactionPipeline)
    .where(eq(transactionPipeline.tenantId, tenant.id));

  const pipeline = pipelines[0];
  const stages = (pipeline?.stages as string[] | null) || [
    "New",
    "Contacted",
    "Viewing",
    "Offer",
    "Closed",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-muted-foreground font-light">
          Track your deal pipeline from first touch to closing.
        </p>
      </div>

      {!pipeline && (
        <div className="border border-dashed border-border/60 p-6 text-sm text-muted-foreground bg-muted/5">
          No pipeline configured yet. Using a default stage set for preview.
          Pipeline editing is coming soon.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage}
            className="border border-border/60 bg-card p-4 flex flex-col gap-3 min-h-[200px] min-w-[200px] hover:shadow-sm transition-all"
          >
            <div className="font-bold text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-2">{stage}</div>
            <div className="text-xs text-muted-foreground flex-1 flex items-center justify-center text-center italic p-4 bg-muted/10 border border-dashed border-border/40">
              No deals
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
