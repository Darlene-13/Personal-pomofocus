import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ================== USERS ==================
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
    email: true,
    name: true,
    password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;


// ================== TASKS ==================
export const tasks = pgTable("tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    text: text("text").notNull(),
    completed: boolean("completed").notNull().default(false),
    created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
    id: true,
    created_at: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// ================== SESSIONS ==================
export const sessions = pgTable("sessions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("userId").references(() => users.id).notNull(), // camelCase for router
    duration: integer("duration").notNull(),
    sessionDate: varchar("sessionDate", { length: 20 }).notNull(),
    sessionTime: varchar("sessionTime", { length: 20 }),
    taskId: varchar("taskId").references(() => tasks.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
    id: true,
    createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;


// ================== STREAKS ==================
export const streaks = pgTable("streaks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id).notNull(),
    current_streak: integer("current_streak").default(0).notNull(),
    longest_streak: integer("longest_streak").default(0).notNull(),
    last_active_date: varchar("last_active_date", { length: 20 }),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ================== APP SETTINGS / THEME ==================
export type Theme = "purple" | "blue" | "green" | "pink" | "orange";

export interface AppSettings {
    workDuration: number;
    breakDuration: number;
    theme: Theme;
    musicGenre: string;
    volume: number;
}
