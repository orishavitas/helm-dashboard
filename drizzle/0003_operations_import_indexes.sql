CREATE UNIQUE INDEX IF NOT EXISTS "projects_owner_name_live_unique"
ON "projects" ("owner_id", "name")
WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "tasks_source_ref_live_unique"
ON "tasks" ("source", "source_ref")
WHERE "deleted_at" IS NULL AND "source_ref" IS NOT NULL;
