ALTER TABLE "subscription" ADD COLUMN "polarSubscriptionId" text;
ALTER TABLE "subscription" ADD COLUMN "polarCustomerId" text;
--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN "stripeSubscriptionId";
--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN "stripeCustomerId";
