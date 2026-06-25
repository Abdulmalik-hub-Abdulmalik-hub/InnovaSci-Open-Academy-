-- ============================================
-- MIGRATION: Add Support Tickets & Membership Plans
-- Description: Adds support ticketing system and subscription/membership models
-- ============================================

-- ============================================
-- 1. SUPPORT & TICKETING SYSTEM
-- ============================================

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
    "email" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) DEFAULT 'open',
    "priority" VARCHAR(20) DEFAULT 'medium',
    "assignedTo" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" TIMESTAMP
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS "ticket_comments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL REFERENCES "support_tickets"("id") ON DELETE CASCADE,
    "userId" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- 2. MEMBERSHIP & SUBSCRIPTION PLANS
-- ============================================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS "subscription_plans" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "billingCycle" VARCHAR(20) NOT NULL,
    "priceMonthly" DECIMAL(10, 2) DEFAULT 0,
    "priceAnnual" DECIMAL(10, 2) DEFAULT 0,
    "features" JSONB,
    "limits" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "planId" UUID NOT NULL REFERENCES "subscription_plans"("id"),
    "billingCycle" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'active',
    "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "autoRenew" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("userId", "planId")
);

-- ============================================
-- 3. SEED DATA FOR SUBSCRIPTION PLANS
-- ============================================

INSERT INTO "subscription_plans" ("id", "name", "slug", "description", "billingCycle", "priceMonthly", "priceAnnual", "features", "limits", "isActive", "createdAt", "updatedAt")
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
-- 4. SEED DATA FOR LEARNING PATHS (updated)
-- ============================================

-- Clear existing learning paths for fresh start
DELETE FROM "learning_path_courses" WHERE "learningPathId" IN (SELECT id FROM "learning_paths");
DELETE FROM "learning_path_progress" WHERE "learningPathId" IN (SELECT id FROM "learning_paths");
DELETE FROM "learning_paths" WHERE "slug" IN ('fundamentals', 'frontend', 'backend', 'research');

-- Insert updated learning paths
INSERT INTO "learning_paths" ("id", "name", "slug", "description", "isPublished", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Fundamentals', 'fundamentals', 'Master the core concepts every scientist and developer needs', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Front-end Development', 'frontend', 'Build beautiful, responsive web interfaces', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Back-end Development', 'backend', 'Build robust APIs and data systems', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Research Methods', 'research', 'Scientific computing and research tools', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS "idx_support_tickets_userId" ON "support_tickets"("userId");
CREATE INDEX IF NOT EXISTS "idx_support_tickets_status" ON "support_tickets"("status");
CREATE INDEX IF NOT EXISTS "idx_support_tickets_category" ON "support_tickets"("category");
CREATE INDEX IF NOT EXISTS "idx_ticket_comments_ticketId" ON "ticket_comments"("ticketId");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_userId" ON "user_subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_planId" ON "user_subscriptions"("planId");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_status" ON "user_subscriptions"("status");

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

SELECT 'support_tickets' as table_name, COUNT(*) as row_count FROM "support_tickets"
UNION ALL
SELECT 'ticket_comments', COUNT(*) FROM "ticket_comments"
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM "subscription_plans"
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM "user_subscriptions"
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM "learning_paths";

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS "user_subscriptions" CASCADE;
-- DROP TABLE IF EXISTS "subscription_plans" CASCADE;
-- DROP TABLE IF EXISTS "ticket_comments" CASCADE;
-- DROP TABLE IF EXISTS "support_tickets" CASCADE;
