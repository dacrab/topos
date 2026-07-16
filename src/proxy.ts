import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/api/upload(.*)",
  "/api/billing(.*)",
  "/api/import(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api/webhooks|api/inquiry|api/v1|api/auth).*)"],
};
