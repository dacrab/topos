import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth is enforced at the resource level, not by path matching:
// - Pages/layouts call `requireTenant()` (redirects unauthenticated visitors)
// - Server actions use `withTenant` / `withUser`
// - Route handlers call `requireTenant()`
// This keeps protected data unreachable even if routing diverges from the matcher.

// Hosts that must never be treated as tenant subdomains.
const NON_TENANT_SUBDOMAINS = new Set(["www", "app", "admin", "api", "staging"]);
const PLATFORM_PATH =
  /^\/(dashboard|settings|onboarding|sign-in|sign-up|invite|pricing|privacy|terms)(\/|$)/;

/**
 * Canonical tenant model: `acme.<root-domain>` rewrites into `/acme/...` so the
 * [subdomain] segment resolves the tenant while all internal links stay scoped.
 * Custom domains and direct /acme path access keep working unchanged.
 */
function rewriteTenantHost(req: Request, host: string): NextResponse | undefined {
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000")
    .replace(/:\d+$/, "")
    .toLowerCase();
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";

  if (!hostname.endsWith(`.${rootDomain}`)) return;
  const sub = hostname.slice(0, -(rootDomain.length + 1));
  if (!sub || sub.includes(".") || NON_TENANT_SUBDOMAINS.has(sub)) return;
  if (!req.url.startsWith("http")) return;

  const url = new URL(req.url);
  if (PLATFORM_PATH.test(url.pathname) || url.pathname.startsWith(`/${sub}/`)) return;

  url.pathname = `/${sub}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export default clerkMiddleware(async (_auth, req) => {
  const rewritten = rewriteTenantHost(req, req.headers.get("host") ?? "");
  if (rewritten) return rewritten;

  // Stamp the pathname so server components can build return URLs after
  // auth redirects (see requireTenant). Rewrite path is excluded: tenant
  // sites are public and never call requireTenant.
  const headers = new Headers(req.headers);
  headers.set("x-pathname", new URL(req.url).pathname);
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api/webhooks|api/inquiry|api/v1|api/auth).*)"],
};
