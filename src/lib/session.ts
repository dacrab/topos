import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Get the current session. Returns null if not authenticated.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
