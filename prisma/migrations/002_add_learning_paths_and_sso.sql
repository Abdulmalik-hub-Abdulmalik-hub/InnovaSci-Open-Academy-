-- ============================================
-- MIGRATION: Add Learning Paths and SSO Support
-- Description: Adds sequential learning paths, granular lecture progress tracking,
--              SSO metadata storage, and module organization
-- ============================================

-- ============================================
-- 1. CREATE AUTHENTICATION TABLES
-- ============================================

-- Create users table (separate from profiles for auth level)
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255),
    "emailVerified" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create SSO accounts table for OAuth/SSO support
CREATE TABLE IF NOT EXISTS "sso_accounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "provider" VARCHAR(50) NOT NULL,
    "providerAccountId" VARCHAR(255) UNIQUE NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires" TIMESTAMP NOT NULL
);

-- ============================================
-- 2. UPDATE PROFILES TABLE
-- ============================================

-- Add userId foreign key to profiles (link to users)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "userId" UUID UNIQUE REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT '{}';
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- ============================================
-- 3. UPDATE LESSONS TABLE
-- ============================================

-- Add moduleId and lessonType to lessons
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "moduleId" UUID REFERENCES "modules"("id") ON DELETE SET NULL;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "lessonType" VARCHAR(50) DEFAULT 'video';
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "duration" INTEGER;

-- ============================================
-- 4. CREATE LEARNING PATHS TABLES
-- ============================================

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS "learning_paths" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "thumbnailUrl" VARCHAR(500),
    "isPublished" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create learning_path_courses junction table (ordered)
CREATE TABLE IF NOT EXISTS "learning_path_courses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "learningPathId" UUID NOT NULL REFERENCES "learning_paths"("id") ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "orderIndex" INTEGER DEFAULT 0 NOT NULL,
    "isRequired" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("learningPathId", "courseId")
);

-- Create learning_path_progress table
CREATE TABLE IF NOT EXISTS "learning_path_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "learningPathId" UUID NOT NULL REFERENCES "learning_paths"("id") ON DELETE CASCADE,
    "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" TIMESTAMP,
    "progressPercent" INTEGER DEFAULT 0,
    UNIQUE("userId", "learningPathId")
);

-- ============================================
-- 5. CREATE GRANULAR PROGRESS TRACKING
-- ============================================

-- Create user_lecture_progress table for fine-grained lesson tracking
CREATE TABLE IF NOT EXISTS "user_lecture_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "lessonId" UUID NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "completed" BOOLEAN DEFAULT false,
    "completedAt" TIMESTAMP,
    "watchTime" INTEGER DEFAULT 0,
    "lastPosition" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("userId", "lessonId")
);

-- Create index for faster progress queries by user and course
CREATE INDEX IF NOT EXISTS "idx_user_lecture_progress_user_course" ON "user_lecture_progress"("userId", "courseId");

-- ============================================
-- 6. CREATE MODULES TABLE
-- ============================================

-- Create modules table for organizing lessons
CREATE TABLE IF NOT EXISTS "modules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("courseId", "orderIndex")
);

-- ============================================
-- 7. UPDATE EXISTING TABLES
-- ============================================

-- Add instructorId relation to courses if not exists
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "instructorId" UUID REFERENCES "profiles"("id") ON DELETE SET NULL;

-- Update audit_logs to reference users if needed
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "users"("id") ON DELETE SET NULL;

-- ============================================
-- 8. DATA MIGRATION HELPERS
-- ============================================

-- Create function to calculate course progress from lecture completion
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_lessons FROM "lessons" WHERE "courseId" = p_course_id;
    
    IF total_lessons = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_lessons 
    FROM "user_lecture_progress" 
    WHERE "userId" = p_user_id 
      AND "courseId" = p_course_id 
      AND "completed" = true;
    
    progress := ROUND((completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100);
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Create function to update learning path progress
CREATE OR REPLACE FUNCTION update_learning_path_progress(p_user_id UUID, p_path_id UUID)
RETURNS VOID AS $$
DECLARE
    total_courses INTEGER;
    completed_courses INTEGER;
    progress INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_courses 
    FROM "learning_path_courses" 
    WHERE "learningPathId" = p_path_id AND "isRequired" = true;
    
    IF total_courses = 0 THEN
        RETURN;
    END IF;
    
    -- Count completed courses in the path
    SELECT COUNT(DISTINCT lpc."courseId") INTO completed_courses
    FROM "learning_path_courses" lpc
    JOIN "enrollments" e ON e."courseId" = lpc."courseId" AND e."userId" = p_user_id
    JOIN "learning_paths" lp ON lp."id" = lpc."learningPathId"
    WHERE lpc."learningPathId" = p_path_id 
      AND lpc."isRequired" = true
      AND e."completed" = true;
    
    progress := ROUND((completed_courses::NUMERIC / total_courses::NUMERIC) * 100);
    
    UPDATE "learning_path_progress"
    SET "progressPercent" = progress,
        "completedAt" = CASE WHEN progress = 100 THEN CURRENT_TIMESTAMP ELSE NULL END,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "userId" = p_user_id AND "learningPathId" = p_path_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. SEED DATA FOR DEMO
-- ============================================

-- Insert demo learning paths
INSERT INTO "learning_paths" ("id", "name", "slug", "description", "isPublished", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Data Science Foundations', 'data-science-foundations', 'Master the fundamentals of data science with this comprehensive learning path', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Computational Biology Track', 'computational-biology-track', 'Explore the intersection of biology and computing', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Machine Learning Engineer', 'ml-engineer', 'Become a machine learning engineer from scratch', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

-- Check new tables were created
SELECT 'learning_paths' as table_name, COUNT(*) as row_count FROM "learning_paths"
UNION ALL
SELECT 'learning_path_courses', COUNT(*) FROM "learning_path_courses"
UNION ALL
SELECT 'learning_path_progress', COUNT(*) FROM "learning_path_progress"
UNION ALL
SELECT 'user_lecture_progress', COUNT(*) FROM "user_lecture_progress"
UNION ALL
SELECT 'modules', COUNT(*) FROM "modules"
UNION ALL
SELECT 'users', COUNT(*) FROM "users"
UNION ALL
SELECT 'sso_accounts', COUNT(*) FROM "sso_accounts"
UNION ALL
SELECT 'sessions', COUNT(*) FROM "sessions";

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS "sessions" CASCADE;
-- DROP TABLE IF EXISTS "sso_accounts" CASCADE;
-- DROP TABLE IF EXISTS "users" CASCADE;
-- DROP TABLE IF EXISTS "user_lecture_progress" CASCADE;
-- DROP TABLE IF EXISTS "learning_path_progress" CASCADE;
-- DROP TABLE IF EXISTS "learning_path_courses" CASCADE;
-- DROP TABLE IF EXISTS "learning_paths" CASCADE;
-- DROP TABLE IF EXISTS "modules" CASCADE;
-- DROP FUNCTION IF EXISTS calculate_course_progress(p_user_id UUID, p_course_id UUID);
-- DROP FUNCTION IF EXISTS update_learning_path_progress(p_user_id UUID, p_path_id UUID);
