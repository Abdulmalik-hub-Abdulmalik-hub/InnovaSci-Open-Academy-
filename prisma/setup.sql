-- ============================================
-- INNOVASCI OPEN ACADEMY - COMPLETE DATABASE SETUP
-- Run this file in your SQL editor to set up the database
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255),
    role VARCHAR(50) DEFAULT 'STUDENT',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CREATE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "fullName" VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    avatar VARCHAR(500),
    bio TEXT,
    phone VARCHAR(50),
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CREATE ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. CREATE PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. CREATE ROLE_PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "roleId" UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    "permissionId" UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("roleId", "permissionId")
);

-- ============================================
-- 6. CREATE USER_ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "roleId" UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "roleId")
);

-- ============================================
-- 7. CREATE COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0,
    "instructorId" UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    level VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    status VARCHAR(50) DEFAULT 'DRAFT',
    "isPublished" BOOLEAN DEFAULT false,
    "isFeatured" BOOLEAN DEFAULT false,
    "isPremium" BOOLEAN DEFAULT false,
    "enrollmentCount" INTEGER DEFAULT 0,
    "completionRate" DECIMAL(5,2) DEFAULT 0,
    duration INTEGER,
    requirements TEXT,
    "whatYouLearn" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. CREATE LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "videoUrl" VARCHAR(500),
    duration INTEGER,
    "isPreview" BOOLEAN DEFAULT false,
    "isPublished" BOOLEAN DEFAULT true,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. CREATE ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "progressPercent" INTEGER DEFAULT 0,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "courseId")
);

-- ============================================
-- 10. CREATE LEARNING_PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "lessonId" UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'NOT_STARTED',
    "watchTime" INTEGER DEFAULT 0,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "lessonId")
);

-- ============================================
-- 11. CREATE CERTIFICATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "verificationCode" VARCHAR(100) UNIQUE,
    "issuedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "courseId")
);

-- ============================================
-- 12. CREATE PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    status VARCHAR(50) DEFAULT 'PENDING',
    "paymentMethod" VARCHAR(50),
    "transactionId" VARCHAR(255),
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. CREATE SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 14. CREATE SUBSCRIPTION_PLANS TABLE
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

-- ============================================
-- 15. CREATE USER_SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "planId" UUID NOT NULL REFERENCES subscription_plans(id),
    "billingCycle" VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "autoRenew" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "planId")
);

-- ============================================
-- 16. CREATE LEARNING_PATHS TABLE
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

-- ============================================
-- 17. CREATE SUPPORT_TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP
);

-- ============================================
-- 18. CREATE AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    details JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 19. CREATE NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 20. CREATE NEWSLETTER_SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP
);

-- ============================================
-- SEED DATA - ROLES
-- ============================================

INSERT INTO roles (id, name, description, "createdAt") VALUES
    (gen_random_uuid(), 'SYSTEM_ADMIN', 'Full system administration access', NOW()),
    (gen_random_uuid(), 'INSTRUCTOR', 'Course instructor with content management access', NOW()),
    (gen_random_uuid(), 'STUDENT', 'Standard learner account', NOW()),
    (gen_random_uuid(), 'GUEST', 'Limited guest access', NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DATA - PERMISSIONS
-- ============================================

INSERT INTO permissions (id, key, description, "createdAt") VALUES
    (gen_random_uuid(), 'users.view', 'View all users', NOW()),
    (gen_random_uuid(), 'users.create', 'Create new users', NOW()),
    (gen_random_uuid(), 'users.update', 'Update user information', NOW()),
    (gen_random_uuid(), 'users.delete', 'Delete users', NOW()),
    (gen_random_uuid(), 'courses.view', 'View all courses', NOW()),
    (gen_random_uuid(), 'courses.create', 'Create new courses', NOW()),
    (gen_random_uuid(), 'courses.update', 'Update courses', NOW()),
    (gen_random_uuid(), 'courses.delete', 'Delete courses', NOW()),
    (gen_random_uuid(), 'payments.view', 'View payment records', NOW()),
    (gen_random_uuid(), 'payments.approve', 'Approve/reject payments', NOW()),
    (gen_random_uuid(), 'settings.view', 'View system settings', NOW()),
    (gen_random_uuid(), 'settings.update', 'Update system settings', NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SEED DATA - ADMIN USER
-- Password: admin123
-- ============================================

DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
    admin_profile_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id FROM users WHERE email = 'abdulmalikmusba@gmail.com';
    
    IF admin_user_id IS NULL THEN
        admin_user_id := gen_random_uuid();
        
        INSERT INTO users (id, email, "passwordHash", role, status, "createdAt", "updatedAt") VALUES
            (admin_user_id, 'abdulmalikmusba@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5iHJ4j.S4IXTK', 'SYSTEM_ADMIN', 'ACTIVE', NOW(), NOW());
    ELSE
        UPDATE users SET role = 'SYSTEM_ADMIN', status = 'ACTIVE' WHERE id = admin_user_id;
    END IF;
    
    -- Get or create SYSTEM_ADMIN role
    SELECT id INTO admin_role_id FROM roles WHERE name = 'SYSTEM_ADMIN';
    
    -- Assign admin role to user
    INSERT INTO user_roles (id, "userId", "roleId", "createdAt")
    VALUES (gen_random_uuid(), admin_user_id, admin_role_id, NOW())
    ON CONFLICT ("userId", "roleId") DO NOTHING;
    
    -- Check if profile exists
    SELECT id INTO admin_profile_id FROM profiles WHERE "userId" = admin_user_id;
    
    -- Create or update admin profile
    IF admin_profile_id IS NULL THEN
        INSERT INTO profiles (id, "userId", "fullName", username, bio, "twoFactorEnabled", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), admin_user_id, 'Abdulmalik Musba', 'abdulmalik', 'System Administrator', false, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET "fullName" = 'Abdulmalik Musba';
    END IF;
    
    RAISE NOTICE 'Admin user setup completed';
END $$;

-- ============================================
-- SEED DATA - DEMO STUDENT USER
-- Password: student123
-- ============================================

DO $$
DECLARE
    student_user_id UUID;
    student_role_id UUID;
    student_profile_id UUID;
BEGIN
    SELECT id INTO student_user_id FROM users WHERE email = 'student@innovasci.com';
    
    IF student_user_id IS NULL THEN
        student_user_id := gen_random_uuid();
        
        INSERT INTO users (id, email, "passwordHash", role, status, "createdAt", "updatedAt") VALUES
            (student_user_id, 'student@innovasci.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT', 'ACTIVE', NOW(), NOW());
    ELSE
        UPDATE users SET role = 'STUDENT', status = 'ACTIVE' WHERE id = student_user_id;
    END IF;
    
    SELECT id INTO student_role_id FROM roles WHERE name = 'STUDENT';
    
    INSERT INTO user_roles (id, "userId", "roleId", "createdAt")
    VALUES (gen_random_uuid(), student_user_id, student_role_id, NOW())
    ON CONFLICT ("userId", "roleId") DO NOTHING;
    
    SELECT id INTO student_profile_id FROM profiles WHERE "userId" = student_user_id;
    
    IF student_profile_id IS NULL THEN
        INSERT INTO profiles (id, "userId", "fullName", username, bio, "twoFactorEnabled", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), student_user_id, 'Demo Student', 'demostudent', 'A learning enthusiast', false, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET "fullName" = 'Demo Student';
    END IF;
    
    RAISE NOTICE 'Demo student setup completed';
END $$;

-- ============================================
-- SEED DATA - SUBSCRIPTION PLANS
-- ============================================

INSERT INTO subscription_plans (id, name, slug, description, "billingCycle", "priceMonthly", "priceAnnual", features, limits, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Free', 'free', 'Get started with basic learning', 'monthly', 0, 0, 
     '["Access to free courses", "Basic progress tracking"]'::jsonb,
     '{"maxCourses": 5}'::jsonb,
     true, NOW(), NOW()),
    (gen_random_uuid(), 'Pro', 'pro', 'Everything you need', 'monthly', 29, 24,
     '["Access to all courses", "Certificates", "Priority support"]'::jsonb,
     '{"maxCourses": -1}'::jsonb,
     true, NOW(), NOW()),
    (gen_random_uuid(), 'Team', 'team', 'For teams and organizations', 'monthly', 79, 65,
     '["Everything in Pro", "Team management", "24/7 support"]'::jsonb,
     '{"maxCourses": -1, "teamMembers": -1}'::jsonb,
     true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Setup Complete!' as status;
SELECT 'Roles: ' || COUNT(*) as result FROM roles
UNION ALL SELECT 'Users: ' || COUNT(*) FROM users
UNION ALL SELECT 'Profiles: ' || COUNT(*) FROM profiles;
