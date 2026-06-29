-- ================================================================================
-- FIX SCHEMA INCONSISTENCIES - COMPLETE FIX
-- This migration fixes all schema issues between Prisma and raw SQL
-- ================================================================================

-- ================================================================================
-- STEP 1: Add missing columns
-- ================================================================================

-- Fix lessons table - Add missing columns
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isExercise" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "exerciseDescription" TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "exerciseFilesUrl" VARCHAR(500);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "solutionVideoUrl" VARCHAR(500);

-- Add missing fields to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "introVideoUrl" VARCHAR(500);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "pricing" JSONB;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "certificateTemplateId" VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "certificateTemplateUrl" VARCHAR(500);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Add missing fields to learning_paths table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_paths' AND column_name = 'title'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'learning_paths' AND column_name = 'name'
        ) THEN
            ALTER TABLE learning_paths RENAME COLUMN name TO title;
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'learning_paths title column check/skipped';
END $$;

ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "subtitle" VARCHAR(255);
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "difficultyLevel" VARCHAR(50) NOT NULL DEFAULT 'beginner';
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "estimatedHours" INTEGER;

-- Add missing fields to learning_path_courses table
ALTER TABLE learning_path_courses ADD COLUMN IF NOT EXISTS "stepTitle" VARCHAR(255);

-- ================================================================================
-- STEP 2: Fix Foreign Key Constraints (CRITICAL!)
-- The Prisma schema expects userId to reference users(id), but raw SQL has it pointing to profiles(id)
-- ================================================================================

-- Helper function to fix foreign keys
CREATE OR REPLACE FUNCTION fix_fk_to_users(table_name TEXT, delete_action TEXT)
RETURNS void AS $$
DECLARE
    fk_name TEXT;
BEGIN
    -- Find constraint pointing to profiles
    SELECT conname INTO fk_name
    FROM pg_constraint
    WHERE contype = 'f'
    AND confrelid = 'profiles'::regclass
    AND conrelid = table_name::regclass;
    
    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE ' || table_name || ' DROP CONSTRAINT ' || fk_name;
        EXECUTE 'ALTER TABLE ' || table_name || ' ADD CONSTRAINT ' || table_name || '_user_fk 
                 FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE ' || delete_action;
        RAISE NOTICE 'Fixed FK in: %', table_name;
    ELSE
        RAISE NOTICE 'No FK to profiles in: %', table_name;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FK fix skipped for: % - %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Fix each table's foreign key
SELECT fix_fk_to_users('enrollments', 'CASCADE');
SELECT fix_fk_to_users('learning_progress', 'CASCADE');
SELECT fix_fk_to_users('user_lecture_progress', 'CASCADE');
SELECT fix_fk_to_users('certificates', 'CASCADE');
SELECT fix_fk_to_users('payments', 'CASCADE');
SELECT fix_fk_to_users('subscriptions', 'CASCADE');
SELECT fix_fk_to_users('wishlists', 'CASCADE');
SELECT fix_fk_to_users('notifications', 'CASCADE');
SELECT fix_fk_to_users('audit_logs', 'SET NULL');
SELECT fix_fk_to_users('support_tickets', 'SET NULL');
SELECT fix_fk_to_users('ticket_comments', 'SET NULL');
SELECT fix_fk_to_users('learning_path_progress', 'CASCADE');

-- Clean up helper function
DROP FUNCTION IF EXISTS fix_fk_to_users(TEXT, TEXT);

-- ================================================================================
-- STEP 3: Create indexes
-- ================================================================================
CREATE INDEX IF NOT EXISTS idx_lessons_courseId ON lessons("courseId");
CREATE INDEX IF NOT EXISTS idx_lessons_moduleId ON lessons("moduleId");
CREATE INDEX IF NOT EXISTS idx_enrollments_userId ON enrollments("userId");
CREATE INDEX IF NOT EXISTS idx_enrollments_courseId ON enrollments("courseId");
CREATE INDEX IF NOT EXISTS idx_learning_progress_userId ON learning_progress("userId");
CREATE INDEX IF NOT EXISTS idx_learning_progress_courseId ON learning_progress("courseId");
CREATE INDEX IF NOT EXISTS idx_learning_progress_lessonId ON learning_progress("lessonId");
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_courseId ON learning_path_courses("courseId");
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- ================================================================================
-- STEP 4: Seed data if needed
-- ================================================================================
DO $$
DECLARE
    path_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO path_count FROM learning_paths;
    IF path_count = 0 THEN
        INSERT INTO learning_paths (title, slug, subtitle, description, difficultyLevel, estimatedHours, "isActive", "isPublished")
        VALUES 
            ('Data Science Foundations', 'data-science-foundations', 'Master data science', 'Learn data analysis, visualization, ML basics', 'beginner', 40, true, true),
            ('Web Development Mastery', 'web-development-mastery', 'Build web apps', 'Full-stack web development with React', 'intermediate', 60, true, true),
            ('Mobile App Development', 'mobile-app-development', 'Create mobile apps', 'Build iOS and Android apps', 'intermediate', 45, true, true);
    ELSE
        UPDATE learning_paths SET "isActive" = true WHERE "isActive" IS NULL;
        UPDATE learning_paths SET difficultyLevel = 'beginner' WHERE difficultyLevel IS NULL;
    END IF;
END $$;

DO $$
DECLARE
    course_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO course_count FROM courses;
    IF course_count = 0 THEN
        INSERT INTO courses (title, slug, category, "shortDescription", "difficultyLevel", "durationHours", price, "isFree", status, "isActive")
        VALUES 
            ('Introduction to Data Science', 'introduction-to-data-science', 'Data Science', 'Learn data science fundamentals', 'beginner', 40, 99.99, false, 'published', true),
            ('Web Development Masterclass', 'web-development-masterclass', 'Web Development', 'Full-stack web dev', 'intermediate', 60, 149.99, false, 'published', true),
            ('Mobile App Development', 'mobile-app-development', 'Mobile Development', 'Build mobile apps', 'intermediate', 45, 0, true, 'published', true);
    ELSE
        UPDATE courses SET "isActive" = true WHERE "isActive" IS NULL;
    END IF;
END $$;

-- ================================================================================
-- STEP 5: Verify and report
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '=== Migration Complete ===';
    RAISE NOTICE 'Columns added to: lessons, courses, learning_paths, learning_path_courses';
    RAISE NOTICE 'Foreign keys fixed to point to users(id)';
    RAISE NOTICE 'Indexes created';
    RAISE NOTICE 'Seed data added if tables were empty';
END $$;

SELECT 'Schema fix migration completed successfully!' as status;
