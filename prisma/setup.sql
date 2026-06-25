-- ============================================
-- INNOVASCI OPEN ACADEMY - SIMPLIFIED DATABASE SETUP
-- Only Admin and Student roles
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE - Only Admin and Student
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255),
    role VARCHAR(50) DEFAULT 'STUDENT' CHECK (role IN ('ADMIN', 'STUDENT')),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "fullName" VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    gender VARCHAR(20),
    bio TEXT,
    "avatarUrl" VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    preferences JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. COURSES TABLE - Managed by Admin
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    "shortDescription" VARCHAR(500),
    "fullDescription" TEXT,
    "learningOutcomes" TEXT,
    prerequisites TEXT,
    "targetAudience" TEXT,
    "difficultyLevel" VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    "durationHours" INTEGER,
    "thumbnailUrl" VARCHAR(500),
    "promoVideoUrl" VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0,
    "isFree" BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'draft',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. MODULES TABLE - Course sections
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("courseId", "orderIndex")
);

-- ============================================
-- 5. LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "moduleId" UUID REFERENCES modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "orderIndex" INTEGER DEFAULT 0,
    "lessonType" VARCHAR(50) DEFAULT 'video',
    duration INTEGER,
    "videoUrl" VARCHAR(500),
    "isPreview" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "lessonId" UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    "fileUrl" VARCHAR(500) NOT NULL,
    visibility VARCHAR(50) DEFAULT 'public',
    "downloadAllowed" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "lessonId" UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    "videoUrl" VARCHAR(500) NOT NULL,
    duration INTEGER,
    provider VARCHAR(50),
    "storageType" VARCHAR(50),
    "orderIndex" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "progressPercent" INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    UNIQUE("userId", "courseId")
);

-- ============================================
-- 9. LEARNING PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "lessonId" UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    "watchTime" INTEGER DEFAULT 0,
    "completedAt" TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "lessonId")
);

-- ============================================
-- 10. USER LECTURE PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_lecture_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    "lessonId" UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    "completedAt" TIMESTAMP,
    "watchTime" INTEGER DEFAULT 0,
    "lastPosition" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "lessonId")
);

-- ============================================
-- 11. CERTIFICATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "certificateUrl" VARCHAR(500),
    "verificationCode" VARCHAR(100) UNIQUE NOT NULL,
    "issuedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'issued',
    UNIQUE("userId", "courseId")
);

-- ============================================
-- 12. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    status VARCHAR(50) DEFAULT 'PENDING',
    "paymentMethod" VARCHAR(50),
    "transactionId" VARCHAR(255),
    "paystackReference" VARCHAR(255),
    channel VARCHAR(50),
    "authorizationCode" VARCHAR(255),
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP,
    "recurringPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 14. LEARNING PATHS TABLE
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
-- 15. LEARNING PATH COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "learningPathId" UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "orderIndex" INTEGER DEFAULT 0,
    "isRequired" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("learningPathId", "courseId")
);

-- ============================================
-- 16. LEARNING PATH PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_path_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    "learningPathId" UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    "progressPercent" INTEGER DEFAULT 0,
    UNIQUE("userId", "learningPathId")
);

-- ============================================
-- 17. WISHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "courseId")
);

-- ============================================
-- 18. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    data JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 19. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    details JSONB,
    "ipAddress" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 20. SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES profiles(id) ON DELETE SET NULL,
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

-- ============================================
-- 21. TICKET COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ticketId" UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    "userId" UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 22. NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP
);

-- ============================================
-- 23. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'string',
    "isPublic" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA - ADMIN USER
-- Password: admin123
-- ============================================

DO $$
DECLARE
    admin_user_id UUID;
    admin_profile_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id FROM users WHERE email = 'abdulmalikmusba@gmail.com';
    
    IF admin_user_id IS NULL THEN
        admin_user_id := gen_random_uuid();
        
        INSERT INTO users (id, email, "passwordHash", role, status, "createdAt", "updatedAt") VALUES
            (admin_user_id, 'abdulmalikmusba@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5iHJ4j.S4IXTK', 'ADMIN', 'ACTIVE', NOW(), NOW());
        
        RAISE NOTICE 'Admin user created';
    ELSE
        UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE id = admin_user_id;
        RAISE NOTICE 'Admin user updated';
    END IF;
    
    -- Check if profile exists
    SELECT id INTO admin_profile_id FROM profiles WHERE "userId" = admin_user_id;
    
    -- Create or update admin profile
    IF admin_profile_id IS NULL THEN
        INSERT INTO profiles (id, "userId", "fullName", username, bio, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), admin_user_id, 'Admin User', 'admin', 'Platform Administrator', 'active', NOW(), NOW());
        RAISE NOTICE 'Admin profile created';
    ELSE
        UPDATE profiles SET "fullName" = 'Admin User', username = 'admin', bio = 'Platform Administrator'
        WHERE id = admin_profile_id;
        RAISE NOTICE 'Admin profile updated';
    END IF;
END $$;

-- ============================================
-- SEED DATA - DEMO STUDENT USER
-- Password: student123
-- ============================================

DO $$
DECLARE
    student_user_id UUID;
    student_profile_id UUID;
BEGIN
    SELECT id INTO student_user_id FROM users WHERE email = 'student@innovasci.com';
    
    IF student_user_id IS NULL THEN
        student_user_id := gen_random_uuid();
        
        INSERT INTO users (id, email, "passwordHash", role, status, "createdAt", "updatedAt") VALUES
            (student_user_id, 'student@innovasci.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT', 'ACTIVE', NOW(), NOW());
        
        RAISE NOTICE 'Student user created';
    ELSE
        UPDATE users SET role = 'STUDENT', status = 'ACTIVE' WHERE id = student_user_id;
        RAISE NOTICE 'Student user updated';
    END IF;
    
    SELECT id INTO student_profile_id FROM profiles WHERE "userId" = student_user_id;
    
    IF student_profile_id IS NULL THEN
        INSERT INTO profiles (id, "userId", "fullName", username, bio, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), student_user_id, 'Demo Student', 'demostudent', 'A learning enthusiast exploring scientific courses', 'active', NOW(), NOW());
        RAISE NOTICE 'Student profile created';
    ELSE
        UPDATE profiles SET "fullName" = 'Demo Student', username = 'demostudent', bio = 'A learning enthusiast exploring scientific courses'
        WHERE id = student_profile_id;
        RAISE NOTICE 'Student profile updated';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Setup Complete!' as status;
SELECT 'Users: ' || COUNT(*) as result FROM users
UNION ALL SELECT 'Profiles: ' || COUNT(*) FROM profiles;
