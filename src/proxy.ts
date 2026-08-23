import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/invite(.*)",
  "/api/upload(.*)",
  "/api/billing(.*)",
  "/api/import(.*)",
]);

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

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
    return;
  }

  const rewritten = rewriteTenantHost(req, req.headers.get("host") ?? "");
  if (rewritten) return rewritten;
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api/webhooks|api/inquiry|api/v1|api/auth).*)"],
};
