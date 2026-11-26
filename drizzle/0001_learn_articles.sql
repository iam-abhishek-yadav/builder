CREATE TYPE "public"."article_category" AS ENUM('system-design', 'case-study');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "article" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"category" "article_category" NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"body" text NOT NULL,
	"source_url" text,
	"source_name" text,
	"reading_minutes" integer DEFAULT 1 NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"author_id" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_status_published_at_idx" ON "article" USING btree ("status","published_at");