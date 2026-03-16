import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Export all navigation helpers — used across the app for locale-aware routing
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
