-- ================================================================================
-- FIX SCHEMA INCONSISTENCIES
-- This migration fixes columns and foreign keys that are inconsistent between
-- the Prisma schema and the raw SQL migrations
-- ================================================================================

-- ------------------------------------------------------------------------------
-- Helper function to drop and recreate foreign key constraints
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fix_user_foreign_key(table_name TEXT, delete_action TEXT)
RETURNS VOID AS $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find existing constraint referencing profiles table
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE confrelid = 'profiles'::regclass
    AND conrelid = table_name::regclass
    AND contype = 'f';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', table_name, constraint_name);
        EXECUTE format(
            'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE %s',
            table_name, table_name || '_userId_fkey', delete_action
        );
        RAISE NOTICE 'Fixed foreign key in table: %', table_name;
    ELSE
        RAISE NOTICE 'No profiles foreign key found in table: %', table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. Fix lessons table - Add missing columns
-- ------------------------------------------------------------------------------
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "isExercise" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "exerciseDescription" TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "exerciseFilesUrl" VARCHAR(500);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "solutionVideoUrl" VARCHAR(500);

-- ------------------------------------------------------------------------------
-- 2. Fix enrollments table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('enrollments', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 3. Fix learning_progress table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('learning_progress', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 4. Fix user_lecture_progress table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('user_lecture_progress', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 5. Fix certificates table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('certificates', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 6. Fix payments table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('payments', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 7. Fix subscriptions table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('subscriptions', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 8. Fix wishlists table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('wishlists', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 9. Fix notifications table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('notifications', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 10. Fix audit_logs table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('audit_logs', 'SET NULL');

-- ------------------------------------------------------------------------------
-- 11. Fix support_tickets table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('support_tickets', 'SET NULL');

-- ------------------------------------------------------------------------------
-- 12. Fix ticket_comments table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('ticket_comments', 'SET NULL');

-- ------------------------------------------------------------------------------
-- 13. Fix learning_path_progress table - Correct foreign key reference
-- ------------------------------------------------------------------------------
SELECT fix_user_foreign_key('learning_path_progress', 'CASCADE');

-- ------------------------------------------------------------------------------
-- 14. Add missing fields to courses table (from course_metadata migration)
-- ------------------------------------------------------------------------------
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "introVideoUrl" VARCHAR(500);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "pricing" JSONB;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "certificateTemplateId" VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "certificateTemplateUrl" VARCHAR(500);

-- ------------------------------------------------------------------------------
-- 15. Add missing fields to learning_paths table
-- ------------------------------------------------------------------------------
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- ------------------------------------------------------------------------------
-- 16. Create missing indexes for better query performance
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lessons_courseId ON lessons("courseId");
CREATE INDEX IF NOT EXISTS idx_lessons_moduleId ON lessons("moduleId");
CREATE INDEX IF NOT EXISTS idx_enrollments_userId ON enrollments("userId");
CREATE INDEX IF NOT EXISTS idx_enrollments_courseId ON enrollments("courseId");
CREATE INDEX IF NOT EXISTS idx_learning_progress_userId ON learning_progress("userId");
CREATE INDEX IF NOT EXISTS idx_learning_progress_courseId ON learning_progress("courseId");
CREATE INDEX IF NOT EXISTS idx_learning_progress_lessonId ON learning_progress("lessonId");
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_courseId ON learning_path_courses("courseId");
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- ------------------------------------------------------------------------------
-- 17. Drop helper function
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fix_user_foreign_key(TEXT, TEXT);

-- ================================================================================
-- VERIFICATION
-- ================================================================================
DO $$
BEGIN
    -- Verify lessons columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'isFree'
    ) THEN
        RAISE WARNING 'Column isFree may not exist in lessons table';
    END IF;
    
    -- Verify learning_paths columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_paths' AND column_name = 'title'
    ) THEN
        -- If title doesn't exist, try to rename name to title
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'learning_paths' AND column_name = 'name'
        ) THEN
            ALTER TABLE learning_paths RENAME COLUMN name TO title;
            RAISE NOTICE 'Renamed name to title in learning_paths table';
        END IF;
    END IF;
END $$;

-- Report status
SELECT 'Schema fix migration completed successfully!' as status;
