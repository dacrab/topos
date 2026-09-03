import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { APP_CONFIG } from "@/lib/config";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12 relative overflow-hidden">
        <div className="absolute inset-0 texture-grid opacity-10" />

        <div className="absolute top-1/3 right-1/4 w-96 h-96 text-background/[0.06] pointer-events-none select-none">
          <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
            <title>Arch</title>
            <path
              d="M50 400V150C50 67 128.2 0 200 0C271.8 0 350 67 350 150V400"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M100 400V150C100 100 155.8 50 200 50C244.2 50 300 100 300 150V400"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.3"
            />
            <circle cx="200" cy="110" r="25" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10">
          <Logo inverted showText serif />
        </div>

        <div className="space-y-8 relative z-10">
          <div className="flex gap-1.5">
            <span className="w-8 h-0.5 bg-background/40 rounded-full" />
            <span className="w-4 h-0.5 bg-background/20 rounded-full" />
            <span className="w-2 h-0.5 bg-background/10 rounded-full" />
          </div>

          <blockquote className="space-y-4 max-w-md">
            <p className="font-display text-xl leading-relaxed tracking-tight">
              &ldquo;Topos transformed how we manage our real estate business. It is the single
              source of truth for our entire team.&rdquo;
            </p>
            <footer>
              <div className="font-medium">Maria K.</div>
              <div className="text-sm text-background/60">Real Estate Agent</div>
            </footer>
          </blockquote>

          <p className="mono-caption text-background/40 text-micro tracking-caps">
            τόπος · a sense of place
          </p>
        </div>

        <p className="text-sm text-background/30 relative z-10">
          &copy; {new Date().getFullYear()} {APP_CONFIG.name}
        </p>
      </div>

      <div className="flex items-center justify-center p-8 relative">
        <div className="absolute top-6 right-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            Home
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
