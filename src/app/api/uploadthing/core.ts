import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentTenant } from "@/lib/currentTenant";

const f = createUploadthing();

/**
 * UploadThing file router for Aether.
 */
export const uploadthingRouter = {
  listingImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      // Attach tenant context so we can associate uploads later.
      const tenant = await getCurrentTenant();
      return { tenantId: tenant.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete", file.url, "for tenant", metadata.tenantId);
    }),
} satisfies FileRouter;

export type UploadthingRouter = typeof uploadthingRouter;
