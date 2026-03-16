import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  // Validate against known locales to prevent path traversal
  const locale = (routing.locales as readonly string[]).includes(raw) ? raw : routing.defaultLocale;

  const messages =
    locale === "el"
      ? (await import("../../messages/el.json")).default
      : (await import("../../messages/en.json")).default;

  return { locale, messages };
});
