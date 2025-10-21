import { pgTable, serial, text, timestamp, boolean, integer, varchar } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    name: varchar('name', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions (Pomodoro work/break sessions)
export const sessions = pgTable('sessions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'work' or 'break'
    duration: integer('duration').notNull(), // in minutes
    date: varchar('date', { length: 20 }).notNull(), // ISO date string
    time: varchar('time', { length: 20 }), // time string
    taskId: integer('task_id').references(() => tasks.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tasks
export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    text: text('text').notNull(),
    completed: boolean('completed').default(false).notNull(),
    priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
});

// Goals
export const goals = pgTable('goals', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
    target: integer('target').notNull(), // target hours or sessions
    metric: varchar('metric', { length: 20 }).notNull(), // 'hours' or 'sessions'
    period: varchar('period', { length: 20 }).notNull(), // date string for the goal period
    achieved: boolean('achieved').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Streaks
export const streaks = pgTable('streaks', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull().unique(),
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    lastActiveDate: varchar('last_active_date', { length: 20 }), // ISO date string
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;

// Theme type (add this if not already there)
export type Theme = 'purple' | 'blue' | "green" | "pink" | "orange";

export interface AppSettings {
    workDuration: number;
    breakDuration: number;
    theme: Theme;
    musicGenre: string;
    volume: number;
}