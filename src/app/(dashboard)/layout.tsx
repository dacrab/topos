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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-1 items-center gap-4">
            <div className="hidden sm:flex flex-col px-6">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                {t("workspace")}
              </span>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                {t("overview")}
              </span>
            </div>
            <div className="relative w-64 sm:w-80 lg:w-96 max-w-full h-full flex items-center border-l border-border/60 pl-4">
              <Search className="pointer-events-none absolute left-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("search")}
                className="h-8 w-full bg-transparent py-2 pl-9 pr-4 text-sm text-foreground shadow-none outline-none transition-all placeholder:text-muted-foreground focus:placeholder:text-foreground/80"
              />
            </div>
          </div>

          <div className="flex items-center h-full border-l border-border/60">
            <div className="flex items-center px-4 gap-1">
              <ModeToggle />
              <LanguageToggle />
            </div>
            <button
              type="button"
              className="relative flex h-14 w-14 items-center justify-center border-l border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-4 right-4 h-1.5 w-1.5 bg-primary ring-1 ring-background" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-0 overflow-auto bg-muted/10">
          <div className="max-w-[1600px] mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
