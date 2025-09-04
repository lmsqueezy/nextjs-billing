import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const webhookEvents = pgTable("webhookEvent", {
  id: integer("id").primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  eventName: text("eventName").notNull(),
  processed: boolean("processed").default(false),
  body: jsonb("body").notNull(),
  processingError: text("processingError"),
});

export const plans = pgTable("plan", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  productName: text("productName"),
  variantId: integer("variantId").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  isUsageBased: boolean("isUsageBased").default(false),
  interval: text("interval"),
  intervalCount: integer("intervalCount"),
  trialInterval: text("trialInterval"),
  trialIntervalCount: integer("trialIntervalCount"),
  sort: integer("sort"),
});

export const subscriptions = pgTable("subscription", {
  id: serial("id").primaryKey(),
  lemonSqueezyId: text("lemonSqueezyId").unique().notNull(),
  orderId: integer("orderId").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull(),
  statusFormatted: text("statusFormatted").notNull(),
  renewsAt: text("renewsAt"),
  endsAt: text("endsAt"),
  trialEndsAt: text("trialEndsAt"),
  price: text("price").notNull(),
  isUsageBased: boolean("isUsageBased").default(false),
  isPaused: boolean("isPaused").default(false),
  subscriptionItemId: integer("subscriptionItemId"),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  planId: integer("planId")
    .notNull()
    .references(() => plans.id),
});

// Project Management Tables
export const projects = pgTable("project", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  idea: text("idea").notNull(),
  script: text("script"),
  scriptStyleId: text("scriptStyleId"),
  inspirationUrls: text("inspirationUrls"), // Store comma-separated URLs or JSON
  duration: real("duration"), // in seconds - supports decimal values
  status: text("status").notNull().default("draft"), // 'draft', 'script-ready', 'generating', 'completed', 'failed'
  format: jsonb("format").$type<{ width: number; height: number }>(),
  settings: jsonb("settings"),
  // Only store non-relational data as JSON
  transcripts: jsonb("transcripts"),
  scriptLines: jsonb("scriptLines"),
  // Video generation specific fields
  voice: text("voice").default("openai_echo"),
  type: text("type").default("faceless_video"),
  mediaType: text("mediaType").default("images"),
  isRemotion: boolean("isRemotion").default(true),
  selectedModel: text("selectedModel").default("basic"),
  audioType: text("audioType").default("library"),
  audioPrompt: text("audioPrompt"),
  watermark: boolean("watermark").default(true),
  isFeatured: boolean("isFeatured").default(false),
  selectedMedia: jsonb("selectedMedia").$type<{images: string[], videos: string[]}>().default({images: [], videos: []}),
  tiktokDescription: text("tiktokDescription"),
  youtubeDescription: text("youtubeDescription"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Overlay Assets Table
export const overlayAssets = pgTable("overlayAsset", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  author: text("author"),
  url: text("url").notNull(),
  preview: text("preview"),
  type: text("type").notNull().default("overlay"),
  isPublic: boolean("isPublic").default(true),
  promptId: text("promptId"),
  images: jsonb("images").default([]),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Project Layers Table
export const projectLayers = pgTable("projectLayer", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'captions', 'backgroundAudio', 'combinedAudio'
  captionStyle: jsonb("captionStyle").$type<{
    fontSize: number;
    fontFamily: string;
    activeWordColor: string;
    inactiveWordColor: string;
    backgroundColor: string;
    fontWeight: string;
    textTransform: string;
    textShadow: string;
    wordAnimation: string[];
    showEmojis: boolean;
    fromBottom: number;
    wordsPerBatch: number;
  }>(),
  volume: real("volume").default(1.0),
  url: text("url"),
  assetId: text("assetId").references(() => overlayAssets.id),
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Project Tracks Table (for future use)
export const projectTracks = pgTable("projectTrack", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'audio', 'video', 'overlay'
  settings: jsonb("settings"),
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const projectSegments = pgTable("projectSegment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  text: text("text").notNull(),
  imagePrompt: text("imagePrompt").notNull(),
  videoPrompt: text("videoPrompt"),
  duration: real("duration"), // in seconds - supports decimal values
  audioVolume: real("audioVolume").default(1.0),
  playBackRate: real("playBackRate").default(1.0),
  withBlur: boolean("withBlur").default(false),
  backgroundMinimized: boolean("backgroundMinimized").default(false),
  wordTimings: jsonb("wordTimings"),
  // Direct URL references for easier access
  imageUrl: text("imageUrl"),
  audioUrl: text("audioUrl"),
  videoUrl: text("videoUrl"),
  // Additional segment properties from mock data
  media: jsonb("media").default([]),
  elements: jsonb("elements").default([]),
  overlayId: text("overlayId").references(() => overlayAssets.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const projectFiles = pgTable("projectFile", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  segmentId: text("segmentId").references(() => projectSegments.id, { onDelete: "cascade" }),
  fileType: text("fileType").notNull(), // 'image', 'video', 'audio', 'overlay'
  fileName: text("fileName").notNull(),
  originalName: text("originalName").notNull(),
  mimeType: text("mimeType").notNull(),
  fileSize: integer("fileSize").notNull(),
  r2Key: text("r2Key").notNull(),
  r2Url: text("r2Url").notNull(),
  tempUrl: text("tempUrl"),
  uploadStatus: text("uploadStatus").notNull().default("uploading"), // 'uploading', 'completed', 'failed'
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
});

const pgUrl = process.env.POSTGRES_URL;

if (!pgUrl) {
  throw new Error("POSTGRES_URL not configured in env");
}

// Export types for the tables.
export type NewPlan = typeof plans.$inferInsert;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type NewSubscription = typeof subscriptions.$inferInsert;

// Project Management Types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectSegment = typeof projectSegments.$inferSelect;
export type NewProjectSegment = typeof projectSegments.$inferInsert;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type NewProjectFile = typeof projectFiles.$inferInsert;
export type ProjectLayer = typeof projectLayers.$inferSelect;
export type NewProjectLayer = typeof projectLayers.$inferInsert;
export type ProjectTrack = typeof projectTracks.$inferSelect;
export type NewProjectTrack = typeof projectTracks.$inferInsert;
export type OverlayAsset = typeof overlayAssets.$inferSelect;
export type NewOverlayAsset = typeof overlayAssets.$inferInsert;

export const sql = neon<boolean, boolean>(pgUrl);
export const db = drizzle(sql, {
  schema: {
    users,
    accounts,
    sessions,
    verificationTokens,
    webhookEvents,
    plans,
    subscriptions,
    projects,
    projectSegments,
    projectFiles,
    projectLayers,
    projectTracks,
    overlayAssets,
  },
});
