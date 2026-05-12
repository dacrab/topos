import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { APP_CONFIG, PROTECTED_PREFIXES } from "./lib/config";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const { pathname, searchParams } = req.nextUrl;
  const rootDomain = APP_CONFIG.domain;

  if (hostname === `app.${rootDomain}`) {
    const isProtected = pathname === "/" || PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

    if (isProtected && !req.cookies.get("better-auth.session_token")?.value) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

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
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
