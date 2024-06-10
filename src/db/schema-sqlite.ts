import { integer, sqliteTable, text, primaryKey, real } from 'drizzle-orm/sqlite-core';
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export const note = sqliteTable("note", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  link: text("link").notNull(),
  title: text("title").notNull(),
  category: text("category"),
  tags: text("tags"),
  dark: integer("dark").default(0),
  textalign: integer("textalign").default(0),//0:left,1:middle,2:right
  css: text("css"),
  content: text("content").notNull(),
  inspiration: text("inspiration"),
  createdAt: real("createdAt").notNull().default(Date.now()),
  updatedAt: real("updatedAt").default(Date.now()),
  userId: text("userId").notNull(),
  authorId: text("authorId").notNull(),
  usedcount: integer("usedcount").default(0),
});

// Add the favorites table
export const favorites = sqliteTable("favorite", {
  userId: text("userId").notNull(),
  articleId: integer("articleId").notNull().references(() => note.id),
}, (favorite) => ({
  compoundKey: primaryKey({
    columns: [favorite.userId, favorite.articleId],
  }),
}));

export type NewArticle = typeof note.$inferInsert;
export type NewFavorite = typeof favorites.$inferInsert;

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL ?? '',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const sqliteDb = drizzle(turso);