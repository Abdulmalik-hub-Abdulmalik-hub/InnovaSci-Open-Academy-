-- Add isActive field to courses table
DO $$ BEGIN
    ALTER TABLE "courses" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add isActive field to lessons table
DO $$ BEGIN
    ALTER TABLE "lessons" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add isActive field to learning_paths table
DO $$ BEGIN
    ALTER TABLE "learning_paths" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add isActive field to forum_threads table
DO $$ BEGIN
    ALTER TABLE "forum_threads" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add isActive field to forum_replies table
DO $$ BEGIN
    ALTER TABLE "forum_replies" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;