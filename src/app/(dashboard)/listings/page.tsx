import { desc, eq } from "drizzle-orm";
import { listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const tenant = await getCurrentTenant();

  const listings = await db
    .select()
    .from(listing)
    .where(eq(listing.tenantId, tenant.id))
    .orderBy(desc(listing.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Listings</h1>
          <p className="text-muted-foreground font-light">
            Manage the properties for {tenant.name}.
          </p>
        </div>
        <button
          type="button"
          className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest opacity-70 cursor-not-allowed hover:opacity-80 transition-opacity"
        >
          New Listing (coming soon)
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="border border-dashed border-border/60 p-12 text-center text-muted-foreground">
          No listings yet. Once you add properties, they&apos;ll show up here
          and on your public site.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <div
              key={item.id}
              className="border border-border/60 bg-card p-6 space-y-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-foreground line-clamp-1">{item.title}</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-muted text-foreground border border-border/40">
                  {item.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2 font-light leading-relaxed">
                {item.description}
              </div>
              <div className="flex items-center justify-between text-sm pt-4 border-t border-border/40">
                <span className="font-mono font-bold text-lg text-foreground">
                  €{item.price.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {(() => {
                    const features =
                      (item.features as {
                        beds?: number;
                        baths?: number;
                      } | null) || {};
                    return `${features.beds ?? 3} beds • ${features.baths ?? 2} baths`;
                  })()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
