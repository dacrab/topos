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
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Bed className="w-3 h-3" />
          {features.beds ?? 0} {t("beds")}
        </span>
        <span className="flex items-center gap-1">
          <Bath className="w-3 h-3" />
          {features.baths ?? 0} {t("baths")}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-border rounded-xl bg-border overflow-hidden">
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
        <div key={label} className="bg-card p-6 text-center">
          <Icon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
          <div className="text-xl font-semibold tabular-nums text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground font-medium mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
