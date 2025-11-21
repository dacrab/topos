import {
  ArrowUpRight,
  Building2,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tc = useTranslations("Common");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground font-light">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          className="bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:bg-primary/90 transition-colors uppercase tracking-wider text-xs shadow-sm"
        >
          {tc("newListing")}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-border/60 bg-card relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("activeListings")}
            </h3>
            <Building2 className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-light text-foreground">12</p>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              +2 <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        <div className="p-6 border border-border/60 bg-card relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("pendingDeals")}
            </h3>
            <FileText className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-light text-foreground">4</p>
            <span className="text-xs font-medium text-muted-foreground">
              {t("onTrack")}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        <div className="p-6 border border-border/60 bg-card relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("revenue")}
            </h3>
            <TrendingUp className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-light text-foreground">€450,000</p>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              +12% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 border border-border/60 bg-card p-8">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">{t("recentActivity")}</h3>
          <div className="space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-8 h-8 bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {i % 2 === 0 ? (
                    <Users className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {i % 2 === 0
                      ? t("newLead")
                      : t("offerReceived")}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions or Mini Calendar */}
        <div className="border border-border/60 bg-card p-8">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">{t("quickStats")}</h3>
          <div className="space-y-px bg-border/60 border border-border/60">
            <div className="flex justify-between items-center p-4 bg-card hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">{t("totalViews")}</span>
              <span className="font-mono font-bold text-foreground">12.5k</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-card hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">{t("inquiries")}</span>
              <span className="font-mono font-bold text-foreground">48</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-card hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">{t("avgTimeOnMarket")}</span>
              <span className="font-mono font-bold text-foreground">42 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
