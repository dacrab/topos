import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { APP_CONFIG } from "./lib/config";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/listings",
  "/contacts",
  "/transactions",
  "/settings",
  "/onboarding",
];

function isDashboardRoute(pathname: string) {
  return pathname === "/" || PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export default async function proxy(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const { pathname, searchParams } = req.nextUrl;
  const pathWithSearch = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;

  const response = intlMiddleware(req);
  const rootDomain = APP_CONFIG.domain;

  if (hostname === `app.${rootDomain}`) {
    if (isDashboardRoute(pathname)) {
      const sessionCookie = req.cookies.get("better-auth.session_token")?.value;
      if (!sessionCookie) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
    }

    return pathname === "/" ? NextResponse.rewrite(new URL("/dashboard", req.url)) : response;
  }

  if (hostname === rootDomain || !hostname) {
    return NextResponse.next();
  }

  if (response.status === 307 || response.status === 308) {
    return response;
  }

  const withoutPort = (h: string) => h.split(":")[0] ?? h;
  const suffix = `.${withoutPort(rootDomain)}`;
  const clean = withoutPort(hostname);
  const subdomain = clean.endsWith(suffix) ? clean.slice(0, -suffix.length) : clean;

  return NextResponse.rewrite(new URL(`/${subdomain}${pathWithSearch}`, req.url));
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
