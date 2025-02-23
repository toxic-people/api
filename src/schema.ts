import { int, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const contentTable = sqliteTable("content", {
  id: int().primaryKey({ autoIncrement: true }),
  url: text().notNull(),
  content: text().notNull(),
  contentOrg: text().notNull(),
  creator: text().notNull(),
  updated: int().notNull(),
  created: int().notNull(),
});

export const personTable = sqliteTable("person", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  country: text().notNull(),
  ratingDisplay: text().notNull(),
  rating: int().notNull(),
  updated: int().notNull(),
  created: int().notNull(),
});
