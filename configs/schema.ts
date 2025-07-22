import { integer, json, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

// Table: users
export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});

export const historyTable = pgTable("historyTable", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  recordId: varchar("recordId", { length: 255 }).notNull(),
  content: json("content"),
  userEmail: varchar("userEmail", { length: 255 })
    .references(() => usersTable.email)
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  aiAgentType: varchar("aiAgentType", { length: 255 }).notNull(),
  metaData:varchar()
  
});
