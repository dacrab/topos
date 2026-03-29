import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { APP_CONFIG } from "./lib/config";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const { pathname, searchParams } = req.nextUrl;
  const pathWithSearch = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;

  const response = intlMiddleware(req);
  const rootDomain = APP_CONFIG.domain;

  if (hostname === `app.${rootDomain}`) {
    return pathname === "/" ? NextResponse.rewrite(new URL("/dashboard", req.url)) : response;
  }

  if (hostname === rootDomain || !hostname) {
    return NextResponse.next();
  }

  if (response.status === 307 || response.status === 308) {
    return response;
  }

  const withoutPort = hostname.split(":")[0] ?? hostname;
  const rootWithoutPort = rootDomain.split(":")[0] ?? rootDomain;
  const suffix = `.${rootWithoutPort}`;
  const subdomain = withoutPort.endsWith(suffix)
    ? withoutPort.slice(0, -suffix.length)
    : withoutPort;

  return NextResponse.rewrite(new URL(`/${subdomain}${pathWithSearch}`, req.url));
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
