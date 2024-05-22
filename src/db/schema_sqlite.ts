import { integer, sqliteTable, text, primaryKey, real } from 'drizzle-orm/sqlite-core';
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
export const articles = sqliteTable("article", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  tags: text("tags"),
  css: text("css"),
  content: text("content").notNull(),
  createdAt: real("createdAt").notNull().default(Date.now()),
  updatedAt: real("updatedAt").default(Date.now()),
  authorId: text("authorId").notNull(),
});

// Add the favorites table
export const favorites = sqliteTable("favorite", {
  userId: text("userId").notNull(),
  articleId: integer("articleId").notNull().references(() => articles.id),
}, (favorite) => ({
  compoundKey: primaryKey({
    columns: [favorite.userId, favorite.articleId],
  }),
}));

export type NewArticle = typeof articles.$inferInsert;
export type NewFavorite = typeof favorites.$inferInsert;

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const sqlite_db = drizzle(turso);