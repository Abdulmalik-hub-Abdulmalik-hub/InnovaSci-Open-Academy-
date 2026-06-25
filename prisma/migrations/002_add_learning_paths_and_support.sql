-- ============================================
-- INNOVASCI OPEN ACADEMY - ADDITIONAL FEATURES
-- Learning Paths, Support Tickets, Subscription Plans
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. LEARNING PATHS (Create if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "thumbnailUrl" VARCHAR(500),
    "isPublished" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_path_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "learningPathId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "orderIndex" INTEGER DEFAULT 0,
    "isRequired" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("learningPathId", "courseId")
);

CREATE TABLE IF NOT EXISTS learning_path_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "learningPathId" UUID NOT NULL,
    "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    "progressPercent" INTEGER DEFAULT 0,
    UNIQUE("userId", "learningPathId")
);

-- ============================================
-- 2. SUPPORT TICKETING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
    "assignedTo" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL,
    "userId" UUID,
    message TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. SUBSCRIPTION PLANS
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "billingCycle" VARCHAR(50),
    "priceMonthly" DECIMAL(10,2) DEFAULT 0,
    "priceAnnual" DECIMAL(10,2) DEFAULT 0,
    features JSONB,
    limits JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "billingCycle" VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "autoRenew" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "planId")
);

-- ============================================
-- 4. ADD PAYSTACK FIELDS TO PAYMENTS
-- ============================================

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'paystackReference') THEN
        ALTER TABLE payments ADD COLUMN "paystackReference" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'channel') THEN
        ALTER TABLE payments ADD COLUMN channel VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'authorizationCode') THEN
        ALTER TABLE payments ADD COLUMN "authorizationCode" VARCHAR(255);
    END IF;
END $$;

-- ============================================
-- 5. ADD USER SUBSCRIPTION PAYSTACK FIELDS
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'paystackCustomerCode') THEN
        ALTER TABLE user_subscriptions ADD COLUMN "paystackCustomerCode" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'paystackAuthorizationCode') THEN
        ALTER TABLE user_subscriptions ADD COLUMN "paystackAuthorizationCode" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'paystackSubscriptionCode') THEN
        ALTER TABLE user_subscriptions ADD COLUMN "paystackSubscriptionCode" VARCHAR(255);
    END IF;
END $$;

-- ============================================
-- 6. ADD COURSE FIELDS
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'promoVideoUrl') THEN
        ALTER TABLE courses ADD COLUMN "promoVideoUrl" VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'learningOutcomes') THEN
        ALTER TABLE courses ADD COLUMN "learningOutcomes" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'prerequisites') THEN
        ALTER TABLE courses ADD COLUMN prerequisites TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'targetAudience') THEN
        ALTER TABLE courses ADD COLUMN "targetAudience" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'difficultyLevel') THEN
        ALTER TABLE courses ADD COLUMN "difficultyLevel" VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'durationHours') THEN
        ALTER TABLE courses ADD COLUMN "durationHours" INTEGER;
    END IF;
END $$;

-- ============================================
-- 7. ADD LESSON FIELDS
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'moduleId') THEN
        ALTER TABLE lessons ADD COLUMN "moduleId" UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'lessonType') THEN
        ALTER TABLE lessons ADD COLUMN "lessonType" VARCHAR(50) DEFAULT 'video';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'videoUrl') THEN
        ALTER TABLE lessons ADD COLUMN "videoUrl" VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'isPreview') THEN
        ALTER TABLE lessons ADD COLUMN "isPreview" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================
-- 8. ADD PROFILE FIELDS
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- ============================================
-- 9. CREATE MODULES TABLE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("courseId", "orderIndex")
);

-- ============================================
-- 10. CREATE USER_LECTURE_PROGRESS IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS user_lecture_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    completed BOOLEAN DEFAULT false,
    "completedAt" TIMESTAMP,
    "watchTime" INTEGER DEFAULT 0,
    "lastPosition" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "lessonId")
);

-- ============================================
-- 11. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_path ON learning_path_courses("learningPathId");
CREATE INDEX IF NOT EXISTS idx_learning_path_progress_user ON learning_path_progress("userId");
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets("userId");
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments("ticketId");
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_user_lecture_progress_user_course ON user_lecture_progress("userId", "courseId");

-- ============================================
-- 12. SEED DATA
-- ============================================

-- Seed Subscription Plans
INSERT INTO subscription_plans (id, name, slug, description, "billingCycle", "priceMonthly", "priceAnnual", features, limits, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Free', 'free', 'Get started with basic learning', 'monthly', 0, 0, 
     '["Access to free courses", "Basic progress tracking", "Community forum"]'::jsonb,
     '{"maxCourses": 5, "certificates": false}'::jsonb,
     true, NOW(), NOW()),
    
    (gen_random_uuid(), 'Pro', 'pro', 'Everything you need for scientific learning', 'monthly', 29, 24,
     '["Access to all courses", "Certificates", "Priority support", "Downloadable resources"]'::jsonb,
     '{"maxCourses": -1, "certificates": true}'::jsonb,
     true, NOW(), NOW()),
    
    (gen_random_uuid(), 'Team', 'team', 'For teams and organizations', 'monthly', 79, 65,
     '["Everything in Pro", "Team dashboard", "24/7 support", "Custom certificates"]'::jsonb,
     '{"maxCourses": -1, "certificates": true, "teamMembers": -1}'::jsonb,
     true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Seed Learning Paths
INSERT INTO learning_paths (id, name, slug, description, "isPublished", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Data Science Foundations', 'data-science-foundations', 'Master the fundamentals of data science', true, NOW(), NOW()),
    (gen_random_uuid(), 'Computational Biology', 'computational-biology', 'Explore biology with computing', true, NOW(), NOW()),
    (gen_random_uuid(), 'Machine Learning', 'machine-learning', 'Become a ML engineer', true, NOW(), NOW()),
    (gen_random_uuid(), 'Fundamentals', 'fundamentals', 'Core concepts for scientists', true, NOW(), NOW()),
    (gen_random_uuid(), 'Research Methods', 'research-methods', 'Scientific computing tools', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Migration 002 completed successfully!' as status;
