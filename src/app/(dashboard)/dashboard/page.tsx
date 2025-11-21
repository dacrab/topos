import {
  Activity,
  ArrowUpRight,
  Building2,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tc = useTranslations("Common");

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">
            {t("title")}
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            System Operational • {new Date().toLocaleDateString()}
          </div>
        </div>
        <button
          type="button"
          className="bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors"
        >
          {tc("newListing")}
        </button>
      </div>

      {/* Data Grid - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
        {/* Metric 1 */}
        <div className="p-8 border-r border-b border-border bg-card hover:bg-secondary/20 transition-colors group relative">
          <div className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-foreground/20 transition-colors">
            <Building2 className="w-12 h-12" />
          </div>
          <div className="flex flex-col h-full justify-between space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("activeListings")}
            </h3>
            <div>
              <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
                12
              </div>
              <div className="flex items-center gap-2 mt-2 text-emerald-600 text-xs font-mono font-bold">
                <ArrowUpRight className="w-3 h-3" /> +16.4%
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-8 border-r border-b border-border bg-card hover:bg-secondary/20 transition-colors group relative">
          <div className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-foreground/20 transition-colors">
            <FileText className="w-12 h-12" />
          </div>
          <div className="flex flex-col h-full justify-between space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("pendingDeals")}
            </h3>
            <div>
              <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
                04
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs font-mono">
                Target: 06
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-8 border-r border-b border-border bg-card hover:bg-secondary/20 transition-colors group relative">
          <div className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-foreground/20 transition-colors">
            <TrendingUp className="w-12 h-12" />
          </div>
          <div className="flex flex-col h-full justify-between space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("revenue")}
            </h3>
            <div>
              <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
                €450k
              </div>
              <div className="flex items-center gap-2 mt-2 text-emerald-600 text-xs font-mono font-bold">
                <ArrowUpRight className="w-3 h-3" /> +12.5%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Activity Stream - Terminal Style */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t("recentActivity")}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">
              LIVE FEED
            </span>
          </div>

          <div className="border border-border bg-background divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group"
              >
                <div className="w-12 h-12 border border-border flex items-center justify-center bg-secondary/50 text-muted-foreground font-mono text-xs group-hover:border-foreground/50 group-hover:text-foreground transition-colors">
                  {i.toString().padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-foreground truncate">
                      {i % 2 === 0 ? t("newLead") : t("offerReceived")}
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      14:3{i} PM
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-mono">
                    ID: #{Math.floor(Math.random() * 9000) + 1000} • User:
                    agent_{i}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats - Data List */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground">
              {t("quickStats")}
            </h3>
          </div>

          <div className="border border-border bg-background">
            <div className="p-6 border-b border-border hover:bg-secondary/10 transition-colors">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                {t("totalViews")}
              </div>
              <div className="text-3xl font-mono font-bold">12,450</div>
            </div>
            <div className="p-6 border-b border-border hover:bg-secondary/10 transition-colors">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                {t("inquiries")}
              </div>
              <div className="text-3xl font-mono font-bold">48</div>
            </div>
            <div className="p-6 hover:bg-secondary/10 transition-colors">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                {t("avgTimeOnMarket")}
              </div>
              <div className="text-3xl font-mono font-bold">
                42{" "}
                <span className="text-sm text-muted-foreground font-sans font-normal">
                  days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
