CREATE TABLE "pomodoro_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"target" integer NOT NULL,
	"metric" varchar(20) NOT NULL,
	"period" varchar(20) NOT NULL,
	"achieved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pomodoro_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" varchar(20) NOT NULL,
	"duration" integer NOT NULL,
	"date" varchar(20) NOT NULL,
	"time" varchar(20),
	"task_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pomodoro_streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" varchar(20),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pomodoro_streaks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "pomodoro_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"text" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pomodoro_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pomodoro_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "pomodoro_goals" ADD CONSTRAINT "pomodoro_goals_user_id_pomodoro_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."pomodoro_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pomodoro_sessions" ADD CONSTRAINT "pomodoro_sessions_user_id_pomodoro_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."pomodoro_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pomodoro_sessions" ADD CONSTRAINT "pomodoro_sessions_task_id_pomodoro_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."pomodoro_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pomodoro_streaks" ADD CONSTRAINT "pomodoro_streaks_user_id_pomodoro_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."pomodoro_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pomodoro_tasks" ADD CONSTRAINT "pomodoro_tasks_user_id_pomodoro_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."pomodoro_users"("id") ON DELETE cascade ON UPDATE no action;