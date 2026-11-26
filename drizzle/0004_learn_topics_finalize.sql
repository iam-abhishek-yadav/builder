ALTER TABLE "article" ALTER COLUMN "topic_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "article" DROP COLUMN "category";--> statement-breakpoint
DROP TYPE "public"."article_category";