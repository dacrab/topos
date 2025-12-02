import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ============================================
// Auth Tables (BetterAuth)
// ============================================

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
  tenantId: text("tenantId").references(() => tenant.id, {
    onDelete: "set null",
  }),
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

// ============================================
// Core Application Tables
// ============================================

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
  listingId: text("listingId").references(() => listing.id, {
    onDelete: "set null",
  }),
  contactId: text("contactId").references(() => contact.id, {
    onDelete: "set null",
  }),
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

export const document = pgTable("document", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  type: text("type").notNull(),
  data: json("data"),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const transactionPipeline = pgTable("transactionPipeline", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  stages: json("stages").notNull(),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ============================================
// User Settings & Billing
// ============================================

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

// ============================================
// Team Management
// ============================================

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
  invitedBy: text("invitedBy").references(() => user.id, {
    onDelete: "set null",
  }),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// Drizzle Relations
// ============================================

export const tenantRelations = relations(tenant, ({ many, one }) => ({
  users: many(user),
  listings: many(listing),
  contacts: many(contact),
  activities: many(activity),
  agents: many(agent),
  documents: many(document),
  pipelines: many(transactionPipeline),
  teamMembers: many(teamMember),
  invitations: many(invitation),
  subscription: one(subscription),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  tenant: one(tenant, { fields: [user.tenantId], references: [tenant.id] }),
  sessions: many(session),
  accounts: many(account),
  activities: many(activity),
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
  activities: many(activity),
}));

export const contactRelations = relations(contact, ({ one, many }) => ({
  tenant: one(tenant, { fields: [contact.tenantId], references: [tenant.id] }),
  activities: many(activity),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  tenant: one(tenant, { fields: [activity.tenantId], references: [tenant.id] }),
  user: one(user, { fields: [activity.userId], references: [user.id] }),
  listing: one(listing, {
    fields: [activity.listingId],
    references: [listing.id],
  }),
  contact: one(contact, {
    fields: [activity.contactId],
    references: [contact.id],
  }),
}));

export const agentRelations = relations(agent, ({ one }) => ({
  tenant: one(tenant, { fields: [agent.tenantId], references: [tenant.id] }),
  user: one(user, { fields: [agent.userId], references: [user.id] }),
}));

export const documentRelations = relations(document, ({ one }) => ({
  tenant: one(tenant, { fields: [document.tenantId], references: [tenant.id] }),
}));

export const transactionPipelineRelations = relations(
  transactionPipeline,
  ({ one }) => ({
    tenant: one(tenant, {
      fields: [transactionPipeline.tenantId],
      references: [tenant.id],
    }),
  }),
);

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, { fields: [userSettings.userId], references: [user.id] }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  tenant: one(tenant, {
    fields: [subscription.tenantId],
    references: [tenant.id],
  }),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  user: one(user, { fields: [teamMember.userId], references: [user.id] }),
  tenant: one(tenant, {
    fields: [teamMember.tenantId],
    references: [tenant.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  tenant: one(tenant, {
    fields: [invitation.tenantId],
    references: [tenant.id],
  }),
  inviter: one(user, { fields: [invitation.invitedBy], references: [user.id] }),
}));

// ============================================
// Type Exports
// ============================================

export type UserSelect = typeof user.$inferSelect;
export type TenantSelect = typeof tenant.$inferSelect;
export type ListingSelect = typeof listing.$inferSelect;
export type ContactSelect = typeof contact.$inferSelect;
export type ActivitySelect = typeof activity.$inferSelect;
export type AgentSelect = typeof agent.$inferSelect;
