-- Seed the two original categories as topics, then point every article at its topic.
INSERT INTO "topic" ("slug", "name", "description", "position") VALUES
  ('system-design', 'System design', 'Building blocks and trade-offs: queues, caches, consistency, scaling.', 10),
  ('case-study', 'Case studies', 'How real teams built, migrated and scaled production systems.', 20)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
UPDATE "article" a SET "topic_id" = t."id"
FROM "topic" t
WHERE a."topic_id" IS NULL AND t."slug" = a."category"::text;
