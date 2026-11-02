import { Bath, Bed, Calendar, Maximize } from "lucide-react";
import type { ListingFeatures } from "@/lib/types";

export function ListingFeatureGrid({
  features,
  t,
  variant = "detail",
}: {
  features: Partial<ListingFeatures>;
  t: (key: string) => string;
  variant?: "detail" | "card";
}) {
  if (variant === "card") {
    return (
      <div className="flex items-center gap-4 micro-caps text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Bed className="h-3 w-3 text-accent" />
          {features.beds ?? 0} {t("beds")}
        </span>
        <span className="h-3 w-px bg-border" />
        <span className="flex items-center gap-1.5">
          <Bath className="h-3 w-3 text-accent" />
          {features.baths ?? 0} {t("baths")}
        </span>
        {features.sqft != null && (
          <>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <Maximize className="h-3 w-3 text-accent" />
              {features.sqft} m²
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 border-t-2 border-foreground/85 sm:grid-cols-4">
      {[
        { icon: Bed, value: features.beds ?? 0, label: t("bedrooms") },
        { icon: Bath, value: features.baths ?? 0, label: t("bathrooms") },
        {
          icon: Maximize,
          value: features.sqft ? `${features.sqft} m²` : "—",
          label: t("sqMeters"),
        },
        { icon: Calendar, value: features.yearBuilt ?? "—", label: t("yearBuilt") },
      ].map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="border-b border-border py-5 pr-4 sm:border-l sm:border-b-0 sm:pl-5 sm:first:border-l-0 sm:first:pl-0"
        >
          <div className="flex items-center gap-1.5 micro-caps text-muted-foreground">
            <Icon className="h-3 w-3 text-accent" />
            {label}
          </div>
          <div className="mt-2 font-display text-2xl leading-none tracking-[-0.02em] tabular-nums text-foreground">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
