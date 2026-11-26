CREATE TABLE "topic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topic_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "article" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN "topic_id" uuid;--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_topic_id_idx" ON "article" USING btree ("topic_id");