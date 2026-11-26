CREATE TABLE "problem_progress" (
	"user_id" text NOT NULL,
	"problem_key" text NOT NULL,
	"solved_at" timestamp with time zone,
	"starred" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "problem_progress_user_id_problem_key_pk" PRIMARY KEY("user_id","problem_key")
);
--> statement-breakpoint
CREATE TABLE "sheet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_name" text,
	"source_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"author_id" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sheet_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "show_practice_progress" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "problem_progress" ADD CONSTRAINT "problem_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sheet" ADD CONSTRAINT "sheet_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sheet_status_published_at_idx" ON "sheet" USING btree ("status","published_at");