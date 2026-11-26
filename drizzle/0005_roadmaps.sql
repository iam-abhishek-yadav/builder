CREATE TABLE "roadmap" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"outline" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"author_id" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "roadmap_progress" (
	"user_id" text NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"item_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_progress_user_id_roadmap_id_item_key_pk" PRIMARY KEY("user_id","roadmap_id","item_key")
);
--> statement-breakpoint
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_progress" ADD CONSTRAINT "roadmap_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_progress" ADD CONSTRAINT "roadmap_progress_roadmap_id_roadmap_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmap"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roadmap_status_published_at_idx" ON "roadmap" USING btree ("status","published_at");