import { Bell, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Common");

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background">
          <div className="flex flex-1 items-center h-full">
            <div className="flex flex-col justify-center h-full px-8 border-r border-border min-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-0.5">
                {t("workspace")}
              </span>
              <span className="text-sm font-medium text-foreground tracking-wide uppercase">
                {t("overview")}
              </span>
            </div>
            <div className="relative flex-1 h-full flex items-center px-6">
              <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("search")}
                className="h-full w-full bg-transparent pl-8 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="flex items-center h-full border-l border-border">
            <div className="flex items-center px-6 gap-4 h-full border-r border-border">
              <ModeToggle />
              <LanguageToggle />
            </div>
            <button
              type="button"
              className="relative flex h-full w-16 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-5 right-5 h-2 w-2 bg-foreground ring-2 ring-background" />
            </button>
          </div>
        </header>
        
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
  );
}
