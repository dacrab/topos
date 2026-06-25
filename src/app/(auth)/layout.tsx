import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { APP_CONFIG } from "@/lib/config";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern-dot opacity-[0.06]" />
        <div className="absolute inset-0 texture-plaster opacity-[0.03]" />
        <div className="relative z-10">
          <Logo inverted showText serif />
        </div>
        <div className="space-y-8 relative z-10">
          <div className="w-24 h-24 text-accent/30 pointer-events-none select-none">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <title>Decorative arch</title>
              <path
                d="M3 21V8C3 4.686 7.03 2 12 2C16.97 2 21 4.686 21 8V21"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M3 13C7 16 17 16 21 13"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1" />
            </svg>
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
          <p className="font-mono text-[10px] tracking-[0.2em] text-background/30 uppercase">
            τόπος · a sense of place
          </p>
        </div>
        <p className="text-sm text-background/40 relative z-10">
          &copy; {new Date().getFullYear()} {APP_CONFIG.name}
        </p>
      </div>
      <div className="flex items-center justify-center p-8 relative">
        <div className="absolute top-4 right-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Home
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
