-- Add isFree column to lessons table
-- This allows individual lessons to be marked as free preview content

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN lessons."isFree" IS 'Whether this lesson is free and accessible without enrollment';

-- Create index for efficient querying of free lessons
CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons("isFree") WHERE "isFree" = true;