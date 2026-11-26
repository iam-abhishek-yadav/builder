ALTER TABLE "user" ADD COLUMN "public_id" text;--> statement-breakpoint
-- Backfill existing users with a short random id before making the column required.
UPDATE "user" SET "public_id" = substr(md5(random()::text || "id"), 1, 8) WHERE "public_id" IS NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "handle" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "headline" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "links" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "open_to_work" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "work_types" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "work_roles" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "work_locations" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "work_city" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "show_roadmap_progress" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_publicId_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_handle_unique" UNIQUE("handle");