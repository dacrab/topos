ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notifications" json;--> statement-breakpoint
CREATE INDEX "idx_activity_tenantId" ON "activity" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_apiKey_tenantId" ON "apiKey" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_appointment_tenantId" ON "appointment" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_auditLog_tenantId" ON "auditLog" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_commission_tenantId" ON "commission" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_contact_tenantId" ON "contact" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_contact_assignedAgentId" ON "contact" USING btree ("assignedAgentId");--> statement-breakpoint
CREATE INDEX "idx_deal_tenantId" ON "deal" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_deal_agentId" ON "deal" USING btree ("agentId");--> statement-breakpoint
CREATE INDEX "idx_document_tenantId" ON "document" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_invitation_tenantId" ON "invitation" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_listing_tenantId" ON "listing" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_listing_tenantId_status" ON "listing" USING btree ("tenantId","status");--> statement-breakpoint
CREATE INDEX "idx_listing_agentId" ON "listing" USING btree ("agentId");--> statement-breakpoint
CREATE INDEX "idx_teamMember_tenantId" ON "teamMember" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_user_tenantId" ON "user" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "idx_webhook_tenantId" ON "webhook" USING btree ("tenantId");