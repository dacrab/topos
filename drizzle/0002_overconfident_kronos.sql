ALTER TABLE "agent" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pipelineTemplate" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscription" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "userSettings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "agent" CASCADE;--> statement-breakpoint
DROP TABLE "pipelineTemplate" CASCADE;--> statement-breakpoint
DROP TABLE "subscription" CASCADE;--> statement-breakpoint
DROP TABLE "userSettings" CASCADE;--> statement-breakpoint
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_agentId_agent_id_fk";
--> statement-breakpoint
ALTER TABLE "commission" DROP CONSTRAINT "commission_agentId_agent_id_fk";
--> statement-breakpoint
ALTER TABLE "contact" DROP CONSTRAINT "contact_assignedAgentId_agent_id_fk";
--> statement-breakpoint
ALTER TABLE "deal" DROP CONSTRAINT "deal_agentId_agent_id_fk";
--> statement-breakpoint
ALTER TABLE "listing" DROP CONSTRAINT "listing_agentId_agent_id_fk";
--> statement-breakpoint
ALTER TABLE "teamMember" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "teamMember" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "teamMember" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "teamMember" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "plan" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "polarSubscriptionId" text;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "polarCustomerId" text;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "currentPeriodEnd" timestamp;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "pipelineStages" json;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notifications" json;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferences" json;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_agentId_teamMember_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."teamMember"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission" ADD CONSTRAINT "commission_agentId_teamMember_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."teamMember"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_assignedAgentId_teamMember_id_fk" FOREIGN KEY ("assignedAgentId") REFERENCES "public"."teamMember"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_agentId_teamMember_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."teamMember"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_agentId_teamMember_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."teamMember"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission" DROP COLUMN "rate";--> statement-breakpoint
ALTER TABLE "deal" DROP COLUMN "commissionRate";