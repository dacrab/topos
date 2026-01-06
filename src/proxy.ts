import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({ ...routing, localePrefix: "never" });

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";
  const searchParams = url.searchParams.toString();
  const pathWithSearch = `${url.pathname}${searchParams ? `?${searchParams}` : ""}`;

  const response = intlMiddleware(req);
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

  if (hostname === `app.${rootDomain}`) {
    return url.pathname === "/" ? NextResponse.rewrite(new URL("/dashboard", req.url)) : response;
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
