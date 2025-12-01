import {
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
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  role: text("role").default("user"),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  tenantId: text("tenantId"), // Relation to Tenant handled manually or via relations
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
  images: text("images").array(), // Postgres array
  address: json("address"),
  features: json("features"),
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Drizzle inference helpers
export type ListingSelect = typeof listing.$inferSelect;

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

export const activity = pgTable("activity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull(), // e.g., 'NEW_LEAD', 'OFFER_RECEIVED', 'LISTING_CREATED', 'CONTACT_ADDED'
  title: text("title").notNull(),
  description: text("description"),
  metadata: json("metadata"), // Store additional data like listing ID, contact ID, etc.
  tenantId: text("tenantId")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agent = pgTable("agent", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  title: text("title").notNull(), // e.g., 'Senior Broker', 'Sales Agent'
  email: text("email"),
  phone: text("phone"),
  image: text("image"),
  bio: text("bio"),
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
  notifications: json("notifications"), // Notification preferences
  preferences: json("preferences"), // Other user preferences
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
  plan: text("plan").default("free").notNull(), // 'free', 'pro', 'enterprise'
  status: text("status").default("active").notNull(), // 'active', 'cancelled', 'past_due'
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Team member roles: 'owner', 'admin', 'agent', 'viewer'
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
  role: text("role").default("agent").notNull(), // 'owner', 'admin', 'agent', 'viewer'
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
  role: text("role").default("agent").notNull(), // 'admin', 'agent', 'viewer'
  invitedBy: text("invitedBy").references(() => user.id, {
    onDelete: "set null",
  }),
  status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'expired'
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
