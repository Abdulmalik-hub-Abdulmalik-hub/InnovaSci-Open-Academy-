-- ================================================================================
-- FIX SCHEMA INCONSISTENCIES
-- This migration fixes columns and foreign keys that are inconsistent between
-- the Prisma schema and the raw SQL migrations
-- ================================================================================

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
-- The Prisma schema expects userId to reference users(id), not profiles(id)
-- Drop the current constraint and recreate it correctly
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_"userId"_fkey;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 3. Fix learning_progress table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE learning_progress DROP CONSTRAINT IF EXISTS learning_progress_"userId"_fkey;
ALTER TABLE learning_progress ADD CONSTRAINT learning_progress_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 4. Fix user_lecture_progress table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE user_lecture_progress DROP CONSTRAINT IF EXISTS user_lecture_progress_"userId"_fkey;
ALTER TABLE user_lecture_progress ADD CONSTRAINT user_lecture_progress_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 5. Fix certificates table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_"userId"_fkey;
ALTER TABLE certificates ADD CONSTRAINT certificates_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 6. Fix payments table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_"userId"_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 7. Fix subscriptions table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_"userId"_fkey;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 8. Fix wishlists table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_"userId"_fkey;
ALTER TABLE wishlists ADD CONSTRAINT wishlists_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 9. Fix notifications table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_"userId"_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 10. Fix audit_logs table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_"userId"_fkey;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 11. Fix support_tickets table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_"userId"_fkey;
ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 12. Fix ticket_comments table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_"userId"_fkey;
ALTER TABLE ticket_comments ADD CONSTRAINT ticket_comments_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 13. Fix learning_path_progress table - Correct foreign key reference
-- ------------------------------------------------------------------------------
ALTER TABLE learning_path_progress DROP CONSTRAINT IF EXISTS learning_path_progress_"userId"_fkey;
ALTER TABLE learning_path_progress ADD CONSTRAINT learning_path_progress_"userId"_fkey 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

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
