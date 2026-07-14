-- Rename name to title and add new fields to learning_paths
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "subtitle" VARCHAR(255);
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "difficultyLevel" VARCHAR(50) NOT NULL DEFAULT 'beginner';
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "estimatedHours" INTEGER;

-- Rename column name to title (only if name column exists and title column doesn't)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_paths' AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_paths' AND column_name = 'title'
    ) THEN
        ALTER TABLE "learning_paths" RENAME COLUMN "name" TO "title";
    END IF;
END $$;

-- Add stepTitle to learning_path_courses
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "stepTitle" VARCHAR(255);