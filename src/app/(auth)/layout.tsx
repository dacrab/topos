import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Logo inverted showText />
        <blockquote className="space-y-4 max-w-md">
          <p className="text-xl leading-relaxed tracking-tight">
            &ldquo;Topos transformed how we manage our real estate business. It is the single source
            of truth for our entire team.&rdquo;
          </p>
          <footer>
            <div className="font-medium">Maria K.</div>
            <div className="text-sm text-background/60">Real Estate Agent</div>
          </footer>
        </blockquote>
        <p className="text-sm text-background/40">&copy; {new Date().getFullYear()} Topos</p>
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
