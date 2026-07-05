import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { APP_CONFIG } from "./lib/config";

const intlMiddleware = createMiddleware(routing);
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get("host") ?? "";
  const { pathname, searchParams } = req.nextUrl;
  const rootDomain = APP_CONFIG.domain;

  // Protect dashboard/api routes (works across all subdomains)
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (hostname === `app.${rootDomain}`) {
    return pathname === "/"
      ? NextResponse.rewrite(new URL("/dashboard", req.url))
      : intlMiddleware(req);
  }

  if (hostname === rootDomain || !hostname) {
    return NextResponse.next();
  }

  const response = intlMiddleware(req);
  if (response.status === 307 || response.status === 308) {
    return response;
  }

  const stripPort = (h: string) => h.split(":")[0] ?? h;
  const suffix = `.${stripPort(rootDomain)}`;
  const clean = stripPort(hostname);
  const subdomain = clean.endsWith(suffix) ? clean.slice(0, -suffix.length) : clean;
  const pathWithSearch = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;

  return NextResponse.rewrite(new URL(`/${subdomain}${pathWithSearch}`, req.url));
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
