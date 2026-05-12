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

// Auth Tables

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  role: text("role").default("user"),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  tenantId: text("tenantId").references(() => tenant.id, { onDelete: "set null" }),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
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
  agentId: text("agentId").references(() => agent.id, { onDelete: "set null" }),
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
  assignedAgentId: text("assignedAgentId").references(() => agent.id, { onDelete: "set null" }),
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
  metadata: json("metadata"),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  listingId: text("listingId").references(() => listing.id, { onDelete: "set null" }),
  contactId: text("contactId").references(() => contact.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agent = pgTable("agent", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  title: text("title").notNull(),
  email: text("email"),
  phone: text("phone"),
  image: text("image"),
  bio: text("bio"),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
  commissionRate: doublePrecision("commissionRate"),
  closedAt: timestamp("closedAt"),
  listingId: text("listingId").references(() => listing.id, { onDelete: "set null" }),
  contactId: text("contactId").references(() => contact.id, { onDelete: "set null" }),
  agentId: text("agentId").references(() => agent.id, { onDelete: "set null" }),
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
    .references(() => agent.id, { onDelete: "cascade" }),
  amount: doublePrecision("amount"),
  rate: doublePrecision("rate"),
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
  agentId: text("agentId").references(() => agent.id, { onDelete: "set null" }),
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

export const userSettings = pgTable("userSettings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  notifications: json("notifications"),
  preferences: json("preferences"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const subscription = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenantId")
    .notNull()
    .unique()
    .references(() => tenant.id, { onDelete: "cascade" }),
  plan: text("plan").default("free").notNull(),
  status: text("status").default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  metadata: json("metadata"),
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

// Pipeline Templates

export const pipelineTemplate = pgTable("pipelineTemplate", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  stages: json("stages").$type<{ name: string; order: number }[]>().notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Relations

export const pipelineTemplateRelations = relations(pipelineTemplate, ({ one }) => ({
  tenant: one(tenant, { fields: [pipelineTemplate.tenantId], references: [tenant.id] }),
}));

export const tenantRelations = relations(tenant, ({ many, one }) => ({
  users: many(user),
  listings: many(listing),
  contacts: many(contact),
  activities: many(activity),
  agents: many(agent),
  deals: many(deal),
  commissions: many(commission),
  documents: many(document),
  appointments: many(appointment),
  auditLogs: many(auditLog),
  teamMembers: many(teamMember),
  invitations: many(invitation),
  subscription: one(subscription),
  pipelineTemplates: many(pipelineTemplate),
  apiKeys: many(apiKey),
  webhooks: many(webhook),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  tenant: one(tenant, { fields: [user.tenantId], references: [tenant.id] }),
  sessions: many(session),
  accounts: many(account),
  activities: many(activity),
  documents: many(document),
  auditLogs: many(auditLog),
  settings: one(userSettings),
  teamMemberships: many(teamMember),
  invitationsSent: many(invitation),
  agent: one(agent),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const listingRelations = relations(listing, ({ one, many }) => ({
  tenant: one(tenant, { fields: [listing.tenantId], references: [tenant.id] }),
  agent: one(agent, { fields: [listing.agentId], references: [agent.id] }),
  activities: many(activity),
  deals: many(deal),
  documents: many(document),
  appointments: many(appointment),
}));

export const contactRelations = relations(contact, ({ one, many }) => ({
  tenant: one(tenant, { fields: [contact.tenantId], references: [tenant.id] }),
  assignedAgent: one(agent, { fields: [contact.assignedAgentId], references: [agent.id] }),
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

export const agentRelations = relations(agent, ({ one, many }) => ({
  tenant: one(tenant, { fields: [agent.tenantId], references: [tenant.id] }),
  user: one(user, { fields: [agent.userId], references: [user.id] }),
  listings: many(listing),
  contacts: many(contact),
  deals: many(deal),
  commissions: many(commission),
  appointments: many(appointment),
}));

export const dealRelations = relations(deal, ({ one, many }) => ({
  listing: one(listing, { fields: [deal.listingId], references: [listing.id] }),
  contact: one(contact, { fields: [deal.contactId], references: [contact.id] }),
  agent: one(agent, { fields: [deal.agentId], references: [agent.id] }),
  tenant: one(tenant, { fields: [deal.tenantId], references: [tenant.id] }),
  commissions: many(commission),
  documents: many(document),
}));

export const commissionRelations = relations(commission, ({ one }) => ({
  deal: one(deal, { fields: [commission.dealId], references: [deal.id] }),
  agent: one(agent, { fields: [commission.agentId], references: [agent.id] }),
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
  agent: one(agent, { fields: [appointment.agentId], references: [agent.id] }),
  tenant: one(tenant, { fields: [appointment.tenantId], references: [tenant.id] }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, { fields: [auditLog.userId], references: [user.id] }),
  tenant: one(tenant, { fields: [auditLog.tenantId], references: [tenant.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, { fields: [userSettings.userId], references: [user.id] }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  tenant: one(tenant, { fields: [subscription.tenantId], references: [tenant.id] }),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  user: one(user, { fields: [teamMember.userId], references: [user.id] }),
  tenant: one(tenant, { fields: [teamMember.tenantId], references: [tenant.id] }),
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
export type DealSelect = typeof deal.$inferSelect;
export type CommissionSelect = typeof commission.$inferSelect;
export type DocumentSelect = typeof document.$inferSelect;
export type AppointmentSelect = typeof appointment.$inferSelect;
export type AuditLogSelect = typeof auditLog.$inferSelect;
