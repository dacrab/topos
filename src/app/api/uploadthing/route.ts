import type { NextRequest } from "next/server";

// Lazily create the UploadThing route handler so that `uploadthing/next`
// and its env-dependent initialization only run at request time, not build time.
async function getUploadthingHandler() {
  const [{ createRouteHandler }, { uploadthingRouter }] = await Promise.all([
    import("uploadthing/next"),
    import("./core"),
  ]);

  return createRouteHandler({ router: uploadthingRouter });
}

export async function GET(req: NextRequest, ctx: unknown) {
  const handler = await getUploadthingHandler();
  // @ts-expect-error: UploadThing handler typing is compatible with Next route handlers at runtime.
  return handler.GET(req, ctx);
}

export async function POST(req: NextRequest, ctx: unknown) {
  const handler = await getUploadthingHandler();
  // @ts-expect-error: UploadThing handler typing is compatible with Next route handlers at runtime.
  return handler.POST(req, ctx);
}
