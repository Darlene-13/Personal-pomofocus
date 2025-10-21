import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    text: text("text").notNull(),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    date: text("date").notNull(),
    duration: integer("duration").notNull(),
    type: text("type").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
    id: true,
    createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
    id: true,
    timestamp: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Theme = "purple" | "blue" | "green" | "pink" | "orange";

export interface AppSettings {
    workDuration: number;
    breakDuration: number;
    theme: Theme;
    musicGenre: string;
    volume: number;
}
