ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons("isFree") WHERE "isFree" = true;