import { int, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const contentTable = sqliteTable("content", {
  id: int("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull().unique(),
  content: text("content").notNull(),
  contentOrg: text("contentOrg").notNull(),
  creator: text("creator").notNull(),
  updated: int("updated").notNull(),
  created: int("created").notNull(),
});

export const personTable = sqliteTable("person", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  country: text("country").notNull(),
  content: text("content").notNull(),
  wikipediaUrl: text("wikipediaUrl").notNull().unique(),
  ratingDisplay: text("ratingDisplay").notNull(),
  rating: int("rating").notNull(),
  updated: int("updated").notNull(),
  created: int("created").notNull(),
});
