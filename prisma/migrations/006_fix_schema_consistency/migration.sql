-- ================================================================================
-- FIX SCHEMA INCONSISTENCIES
-- This migration fixes columns that are missing in the database
-- but expected by the Prisma schema
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
-- 2. Add missing fields to courses table
-- ------------------------------------------------------------------------------
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "introVideoUrl" VARCHAR(500);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "pricing" JSONB;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "certificateTemplateId" VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "certificateTemplateUrl" VARCHAR(500);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- ------------------------------------------------------------------------------
-- 3. Add missing fields to learning_paths table
-- ------------------------------------------------------------------------------
-- First check if title column exists, if not rename name to title
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
            RAISE NOTICE 'Renamed name to title in learning_paths table';
        END IF;
    END IF;
END $$;

-- Add isActive column
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "subtitle" VARCHAR(255);
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "difficultyLevel" VARCHAR(50) NOT NULL DEFAULT 'beginner';
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS "estimatedHours" INTEGER;

-- ------------------------------------------------------------------------------
-- 4. Add missing fields to learning_path_courses table
-- ------------------------------------------------------------------------------
ALTER TABLE learning_path_courses ADD COLUMN IF NOT EXISTS "stepTitle" VARCHAR(255);

-- ------------------------------------------------------------------------------
-- 5. Create missing indexes for better query performance
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
-- 6. Seed learning paths if none exist
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    path_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO path_count FROM learning_paths;
    
    IF path_count = 0 THEN
        INSERT INTO learning_paths (title, slug, subtitle, description, difficultyLevel, estimatedHours, "isActive", "isPublished")
        VALUES 
            ('Data Science Foundations', 'data-science-foundations', 'Master the fundamentals of data science', 
             'Learn data analysis, visualization, and machine learning basics with Python and R', 
             'beginner', 40, true, true),
            ('Web Development Mastery', 'web-development-mastery', 'Build modern web applications', 
             'From HTML basics to full-stack development with React and Node.js', 
             'intermediate', 60, true, true),
            ('Mobile App Development', 'mobile-app-development', 'Create cross-platform apps', 
             'Build iOS and Android apps using React Native', 
             'intermediate', 45, true, true);
        
        RAISE NOTICE 'Seeded 3 learning paths';
    ELSE
        -- Update existing paths to have isActive if missing
        UPDATE learning_paths SET "isActive" = true WHERE "isActive" IS NULL;
        UPDATE learning_paths SET difficultyLevel = 'beginner' WHERE difficultyLevel IS NULL;
        RAISE NOTICE 'Updated existing learning paths';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 7. Seed courses if none exist
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    course_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO course_count FROM courses;
    
    IF course_count = 0 THEN
        INSERT INTO courses (title, slug, category, "shortDescription", "difficultyLevel", "durationHours", price, "isFree", status, "isActive")
        VALUES 
            ('Introduction to Data Science', 'introduction-to-data-science', 'Data Science', 
             'Learn the fundamentals of data science with Python', 'beginner', 40, 99.99, false, 'published', true),
            ('Web Development Masterclass', 'web-development-masterclass', 'Web Development', 
             'Full-stack web development with React and Node.js', 'intermediate', 60, 149.99, false, 'published', true),
            ('Mobile App Development with React Native', 'mobile-app-development', 'Mobile Development', 
             'Build cross-platform mobile apps', 'intermediate', 45, 0, true, 'published', true);
        
        RAISE NOTICE 'Seeded 3 courses';
    ELSE
        -- Update existing courses to have isActive if missing
        UPDATE courses SET "isActive" = true WHERE "isActive" IS NULL;
        RAISE NOTICE 'Updated existing courses';
    END IF;
END $$;

-- Report status
SELECT 'Schema fix migration completed successfully!' as status;
SELECT 'Tables updated: lessons, courses, learning_paths, learning_path_courses' as summary;
