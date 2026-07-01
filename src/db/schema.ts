import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  doublePrecision,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  tenantId: text("tenantId").references(() => tenant.id, { onDelete: "set null" }),
});

// Application Tables

export const tenant = pgTable("tenant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  customDomain: text("customDomain").unique(),
  logoUrl: text("logoUrl"),
  branding: json("branding"),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  plan: text("plan").default("free").notNull(),
  status: text("status").default("active").notNull(),
  polarSubscriptionId: text("polarSubscriptionId"),
  polarCustomerId: text("polarCustomerId"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  pipelineStages: json("pipelineStages").$type<{ name: string; order: number }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const teamMember = pgTable("teamMember", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  role: text("role").default("agent").notNull(),
  title: text("title"),
  phone: text("phone"),
  bio: text("bio"),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const listing = pgTable("listing", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  status: text("status").default("DRAFT").notNull(),
  images: text("images").array(),
  address: json("address"),
  features: json("features"),
  agentId: text("agentId").references(() => teamMember.id, { onDelete: "set null" }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const contact = pgTable("contact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: text("firstName").notNull(),
  lastName: text("lastName"),
  email: text("email"),
  phone: text("phone"),
  type: text("type").default("LEAD").notNull(),
  source: text("source"),
  notes: text("notes"),
  assignedAgentId: text("assignedAgentId").references(() => teamMember.id, {
    onDelete: "set null",
  }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const activity = pgTable("activity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  listingId: text("listingId").references(() => listing.id, { onDelete: "set null" }),
  contactId: text("contactId").references(() => contact.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const deal = pgTable("deal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  stage: text("stage").default("new").notNull(),
  status: text("status").default("active").notNull(),
  price: doublePrecision("price"),
  commission: doublePrecision("commission"),
  closedAt: timestamp("closedAt"),
  listingId: text("listingId").references(() => listing.id, { onDelete: "set null" }),
  contactId: text("contactId").references(() => contact.id, { onDelete: "set null" }),
  agentId: text("agentId").references(() => teamMember.id, { onDelete: "set null" }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const commission = pgTable("commission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  dealId: text("dealId")
    .notNull()
    .references(() => deal.id, { onDelete: "cascade" }),
  agentId: text("agentId")
    .notNull()
    .references(() => teamMember.id, { onDelete: "cascade" }),
  amount: doublePrecision("amount"),
  type: text("type").notNull(),
  status: text("status").default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const document = pgTable("document", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  size: doublePrecision("size"),
  dealId: text("dealId").references(() => deal.id, { onDelete: "set null" }),
  listingId: text("listingId").references(() => listing.id, { onDelete: "set null" }),
  contactId: text("contactId").references(() => contact.id, { onDelete: "set null" }),
  uploadedBy: text("uploadedBy")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appointment = pgTable("appointment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  type: text("type").notNull(),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt").notNull(),
  notes: text("notes"),
  recurrence: text("recurrence"),
  recurrenceEnd: timestamp("recurrenceEnd"),
  parentId: text("parentId").references((): AnyPgColumn => appointment.id, {
    onDelete: "set null",
  }),
  listingId: text("listingId").references(() => listing.id, { onDelete: "set null" }),
  contactId: text("contactId").references(() => contact.id, { onDelete: "set null" }),
  agentId: text("agentId").references(() => teamMember.id, { onDelete: "set null" }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const auditLog = pgTable("auditLog", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entityId").notNull(),
  changes: json("changes"),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const apiKey = pgTable("apiKey", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
});

export const webhook = pgTable("webhook", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(),
  events: text("events").array().notNull(),
  secret: text("secret").notNull(),
  active: boolean("active").default(true).notNull(),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  role: text("role").default("agent").notNull(),
  invitedBy: text("invitedBy").references(() => user.id, { onDelete: "set null" }),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Relations

export const tenantRelations = relations(tenant, ({ many }) => ({
  users: many(user),
  listings: many(listing),
  contacts: many(contact),
  activities: many(activity),
  deals: many(deal),
  commissions: many(commission),
  documents: many(document),
  appointments: many(appointment),
  auditLogs: many(auditLog),
  teamMembers: many(teamMember),
  invitations: many(invitation),
  apiKeys: many(apiKey),
  webhooks: many(webhook),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  tenant: one(tenant, { fields: [user.tenantId], references: [tenant.id] }),
  activities: many(activity),
  documents: many(document),
  auditLogs: many(auditLog),
  teamMemberships: many(teamMember),
  invitationsSent: many(invitation),
}));

export const teamMemberRelations = relations(teamMember, ({ one, many }) => ({
  user: one(user, { fields: [teamMember.userId], references: [user.id] }),
  tenant: one(tenant, { fields: [teamMember.tenantId], references: [tenant.id] }),
  listings: many(listing),
  contacts: many(contact),
  deals: many(deal),
  commissions: many(commission),
  appointments: many(appointment),
}));

export const listingRelations = relations(listing, ({ one, many }) => ({
  tenant: one(tenant, { fields: [listing.tenantId], references: [tenant.id] }),
  agent: one(teamMember, { fields: [listing.agentId], references: [teamMember.id] }),
  activities: many(activity),
  deals: many(deal),
  documents: many(document),
  appointments: many(appointment),
}));

export const contactRelations = relations(contact, ({ one, many }) => ({
  tenant: one(tenant, { fields: [contact.tenantId], references: [tenant.id] }),
  assignedAgent: one(teamMember, {
    fields: [contact.assignedAgentId],
    references: [teamMember.id],
  }),
  activities: many(activity),
  deals: many(deal),
  documents: many(document),
  appointments: many(appointment),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  tenant: one(tenant, { fields: [activity.tenantId], references: [tenant.id] }),
  user: one(user, { fields: [activity.userId], references: [user.id] }),
  listing: one(listing, { fields: [activity.listingId], references: [listing.id] }),
  contact: one(contact, { fields: [activity.contactId], references: [contact.id] }),
}));

export const dealRelations = relations(deal, ({ one, many }) => ({
  listing: one(listing, { fields: [deal.listingId], references: [listing.id] }),
  contact: one(contact, { fields: [deal.contactId], references: [contact.id] }),
  agent: one(teamMember, { fields: [deal.agentId], references: [teamMember.id] }),
  tenant: one(tenant, { fields: [deal.tenantId], references: [tenant.id] }),
  commissions: many(commission),
  documents: many(document),
}));

export const commissionRelations = relations(commission, ({ one }) => ({
  deal: one(deal, { fields: [commission.dealId], references: [deal.id] }),
  agent: one(teamMember, { fields: [commission.agentId], references: [teamMember.id] }),
  tenant: one(tenant, { fields: [commission.tenantId], references: [tenant.id] }),
}));

export const documentRelations = relations(document, ({ one }) => ({
  deal: one(deal, { fields: [document.dealId], references: [deal.id] }),
  listing: one(listing, { fields: [document.listingId], references: [listing.id] }),
  contact: one(contact, { fields: [document.contactId], references: [contact.id] }),
  uploader: one(user, { fields: [document.uploadedBy], references: [user.id] }),
  tenant: one(tenant, { fields: [document.tenantId], references: [tenant.id] }),
}));

export const appointmentRelations = relations(appointment, ({ one }) => ({
  listing: one(listing, { fields: [appointment.listingId], references: [listing.id] }),
  contact: one(contact, { fields: [appointment.contactId], references: [contact.id] }),
  agent: one(teamMember, { fields: [appointment.agentId], references: [teamMember.id] }),
  tenant: one(tenant, { fields: [appointment.tenantId], references: [tenant.id] }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, { fields: [auditLog.userId], references: [user.id] }),
  tenant: one(tenant, { fields: [auditLog.tenantId], references: [tenant.id] }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  tenant: one(tenant, { fields: [invitation.tenantId], references: [tenant.id] }),
  inviter: one(user, { fields: [invitation.invitedBy], references: [user.id] }),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  tenant: one(tenant, { fields: [apiKey.tenantId], references: [tenant.id] }),
}));

export const webhookRelations = relations(webhook, ({ one }) => ({
  tenant: one(tenant, { fields: [webhook.tenantId], references: [tenant.id] }),
}));

// Types

export type ListingSelect = typeof listing.$inferSelect;
export type ActivitySelect = typeof activity.$inferSelect;
