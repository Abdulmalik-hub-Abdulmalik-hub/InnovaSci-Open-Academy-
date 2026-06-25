-- ============================================
-- MIGRATION: Add Learning Paths, Support Tickets & Subscription Plans
-- Description: Adds sequential learning paths, granular lecture progress tracking,
--              support ticketing system, and subscription/membership models
-- ============================================

-- ============================================
-- 1. LEARNING PATHS TABLES (using snake_case)
-- ============================================

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS "learning_paths" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "thumbnail_url" VARCHAR(500),
    "is_published" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create learning_path_courses junction table (ordered)
CREATE TABLE IF NOT EXISTS "learning_path_courses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "learning_path_id" UUID NOT NULL REFERENCES "learning_paths"("id") ON DELETE CASCADE,
    "course_id" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "order_index" INTEGER DEFAULT 0 NOT NULL,
    "is_required" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("learning_path_id", "course_id")
);

-- Create learning_path_progress table
CREATE TABLE IF NOT EXISTS "learning_path_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "learning_path_id" UUID NOT NULL REFERENCES "learning_paths"("id") ON DELETE CASCADE,
    "enrolled_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completed_at" TIMESTAMP,
    "progress_percent" INTEGER DEFAULT 0,
    UNIQUE("user_id", "learning_path_id")
);

-- ============================================
-- 2. GRANULAR PROGRESS TRACKING (snake_case)
-- ============================================

-- Create user_lecture_progress table for fine-grained lesson tracking
CREATE TABLE IF NOT EXISTS "user_lecture_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "lesson_id" UUID NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
    "course_id" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "completed" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMP,
    "watch_time" INTEGER DEFAULT 0,
    "last_position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("user_id", "lesson_id")
);

-- Create index for faster progress queries by user and course
CREATE INDEX IF NOT EXISTS "idx_user_lecture_progress_user_course" ON "user_lecture_progress"("user_id", "course_id");

-- ============================================
-- 3. MODULES TABLE (snake_case)
-- ============================================

-- Create modules table for organizing lessons
CREATE TABLE IF NOT EXISTS "modules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order_index" INTEGER DEFAULT 0 NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("course_id", "order_index")
);

-- ============================================
-- 4. SUPPORT & TICKETING SYSTEM (snake_case)
-- ============================================

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
    "email" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) DEFAULT 'open',
    "priority" VARCHAR(20) DEFAULT 'medium',
    "assigned_to" VARCHAR(255),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolved_at" TIMESTAMP
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS "ticket_comments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL REFERENCES "support_tickets"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
    "message" TEXT NOT NULL,
    "is_internal" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- 5. SUBSCRIPTION PLANS (snake_case)
-- ============================================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS "subscription_plans" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "billing_cycle" VARCHAR(20) NOT NULL,
    "price_monthly" DECIMAL(10, 2) DEFAULT 0,
    "price_annual" DECIMAL(10, 2) DEFAULT 0,
    "features" JSONB,
    "limits" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "plan_id" UUID NOT NULL REFERENCES "subscription_plans"("id"),
    "billing_cycle" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'active',
    "start_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP,
    "cancelled_at" TIMESTAMP,
    "auto_renew" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("user_id", "plan_id")
);

-- ============================================
-- 6. UPDATE EXISTING TABLES (add missing columns)
-- ============================================

-- Add instructor_id relation to courses if not exists
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "instructor_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL;

-- Add module_id to lessons if not exists
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "module_id" UUID REFERENCES "modules"("id") ON DELETE SET NULL;

-- Add lesson_type and duration to lessons if not exists
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "lesson_type" VARCHAR(50) DEFAULT 'video';
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "duration" INTEGER;

-- Add two_factor_enabled to profiles if not exists
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN DEFAULT false;

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS "idx_support_tickets_user_id" ON "support_tickets"("user_id");
CREATE INDEX IF NOT EXISTS "idx_support_tickets_status" ON "support_tickets"("status");
CREATE INDEX IF NOT EXISTS "idx_support_tickets_category" ON "support_tickets"("category");
CREATE INDEX IF NOT EXISTS "idx_ticket_comments_ticket_id" ON "ticket_comments"("ticket_id");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_user_id" ON "user_subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_plan_id" ON "user_subscriptions"("plan_id");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_status" ON "user_subscriptions"("status");
CREATE INDEX IF NOT EXISTS "idx_learning_paths_slug" ON "learning_paths"("slug");
CREATE INDEX IF NOT EXISTS "idx_learning_path_courses_path_id" ON "learning_path_courses"("learning_path_id");
CREATE INDEX IF NOT EXISTS "idx_learning_path_progress_user_id" ON "learning_path_progress"("user_id");

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
    SELECT COUNT(*) INTO total_lessons FROM "lessons" WHERE "course_id" = p_course_id;
    
    IF total_lessons = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_lessons 
    FROM "user_lecture_progress" 
    WHERE "user_id" = p_user_id 
      AND "course_id" = p_course_id 
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
    WHERE "learning_path_id" = p_path_id AND "is_required" = true;
    
    IF total_courses = 0 THEN
        RETURN;
    END IF;
    
    -- Count completed courses in the path
    SELECT COUNT(DISTINCT lpc."course_id") INTO completed_courses
    FROM "learning_path_courses" lpc
    JOIN "enrollments" e ON e."course_id" = lpc."course_id" AND e."user_id" = p_user_id
    JOIN "learning_paths" lp ON lp."id" = lpc."learning_path_id"
    WHERE lpc."learning_path_id" = p_path_id 
      AND lpc."is_required" = true
      AND e."completed" = true;
    
    progress := ROUND((completed_courses::NUMERIC / total_courses::NUMERIC) * 100);
    
    UPDATE "learning_path_progress"
    SET "progress_percent" = progress,
        "completed_at" = CASE WHEN progress = 100 THEN CURRENT_TIMESTAMP ELSE NULL END,
        "updated_at" = CURRENT_TIMESTAMP
    WHERE "user_id" = p_user_id AND "learning_path_id" = p_path_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. SEED DATA FOR DEMO
-- ============================================

-- Insert demo learning paths
INSERT INTO "learning_paths" ("id", "name", "slug", "description", "is_published", "created_at", "updated_at")
VALUES 
    (gen_random_uuid(), 'Data Science Foundations', 'data-science-foundations', 'Master the fundamentals of data science with this comprehensive learning path', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Computational Biology Track', 'computational-biology-track', 'Explore the intersection of biology and computing', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Machine Learning Engineer', 'ml-engineer', 'Become a machine learning engineer from scratch', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Fundamentals', 'fundamentals', 'Master the core concepts every scientist and developer needs', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Front-end Development', 'frontend', 'Build beautiful, responsive web interfaces', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Back-end Development', 'backend', 'Build robust APIs and data systems', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Research Methods', 'research', 'Scientific computing and research tools', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Insert subscription plans
INSERT INTO "subscription_plans" ("id", "name", "slug", "description", "billing_cycle", "price_monthly", "price_annual", "features", "limits", "is_active", "created_at", "updated_at")
VALUES 
    (gen_random_uuid(), 'Free', 'free', 'Get started with basic learning', 'monthly', 0, 0, 
     '["Access to free courses", "Community forum access", "Basic progress tracking", "Email support"]'::jsonb,
     '{"maxCourses": 5, "certificates": false, "downloads": false}'::jsonb,
     true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (gen_random_uuid(), 'Pro', 'pro', 'Everything you need to master scientific computing', 'monthly', 29, 24,
     '["Access to all courses", "Community forum access", "Advanced progress tracking", "Priority email support", "Certificate of completion", "Downloadable resources"]'::jsonb,
     '{"maxCourses": -1, "certificates": true, "downloads": true}'::jsonb,
     true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (gen_random_uuid(), 'Team', 'team', 'For teams and organizations', 'monthly', 79, 65,
     '["Everything in Pro", "Team management dashboard", "Collaborative learning", "24/7 phone support", "Custom certificates", "Offline downloads", "Dedicated account manager", "Custom learning paths"]'::jsonb,
     '{"maxCourses": -1, "certificates": true, "downloads": true, "teamMembers": -1}'::jsonb,
     true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

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
SELECT 'support_tickets', COUNT(*) FROM "support_tickets"
UNION ALL
SELECT 'ticket_comments', COUNT(*) FROM "ticket_comments"
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM "subscription_plans"
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM "user_subscriptions";

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS "user_subscriptions" CASCADE;
-- DROP TABLE IF EXISTS "subscription_plans" CASCADE;
-- DROP TABLE IF EXISTS "ticket_comments" CASCADE;
-- DROP TABLE IF EXISTS "support_tickets" CASCADE;
-- DROP TABLE IF EXISTS "user_lecture_progress" CASCADE;
-- DROP TABLE IF EXISTS "learning_path_progress" CASCADE;
-- DROP TABLE IF EXISTS "learning_path_courses" CASCADE;
-- DROP TABLE IF EXISTS "learning_paths" CASCADE;
-- DROP TABLE IF EXISTS "modules" CASCADE;
-- DROP FUNCTION IF EXISTS calculate_course_progress(p_user_id UUID, p_course_id UUID);
-- DROP FUNCTION IF EXISTS update_learning_path_progress(p_user_id UUID, p_path_id UUID);
