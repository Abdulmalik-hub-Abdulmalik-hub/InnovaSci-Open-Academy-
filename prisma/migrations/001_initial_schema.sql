-- ============================================
-- INNOVASCI OPEN ACADEMY - INITIAL DATABASE SCHEMA
-- Run this file FIRST to create all tables
-- Can be run multiple times safely (uses DROP IF EXISTS)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (for idempotent runs)
-- ============================================

DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS learning_path_progress CASCADE;
DROP TABLE IF EXISTS learning_path_courses CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS user_lecture_progress CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
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
-- 2. PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
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
-- 3. COURSES TABLE
-- ============================================
CREATE TABLE courses (
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
-- 4. MODULES TABLE
-- ============================================
CREATE TABLE modules (
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
CREATE TABLE lessons (
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
CREATE TABLE materials (
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
CREATE TABLE videos (
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
CREATE TABLE enrollments (
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
CREATE TABLE learning_progress (
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
CREATE TABLE user_lecture_progress (
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
CREATE TABLE certificates (
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
CREATE TABLE payments (
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
CREATE TABLE subscriptions (
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
CREATE TABLE learning_paths (
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
CREATE TABLE learning_path_courses (
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
CREATE TABLE learning_path_progress (
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
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "courseId")
);

-- ============================================
-- 18. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
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
CREATE TABLE audit_logs (
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
CREATE TABLE support_tickets (
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
CREATE TABLE ticket_comments (
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
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP
);

-- ============================================
-- 23. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'string',
    "isPublic" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enrollments_user ON enrollments("userId");
CREATE INDEX idx_enrollments_course ON enrollments("courseId");
CREATE INDEX idx_payments_user ON payments("userId");
CREATE INDEX idx_notifications_user ON notifications("userId");
CREATE INDEX idx_audit_logs_user ON audit_logs("userId");
CREATE INDEX idx_support_tickets_user ON support_tickets("userId");
CREATE INDEX idx_learning_path_courses_path ON learning_path_courses("learningPathId");
CREATE INDEX idx_learning_path_progress_user ON learning_path_progress("userId");
CREATE INDEX idx_user_lecture_progress_user_course ON user_lecture_progress("userId", "courseId");

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = current_setting('app.current_user_id', TRUE)::uuid
        AND u.role = 'ADMIN'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT u.role 
        FROM users u
        WHERE u.id = current_setting('app.current_user_id', TRUE)::uuid
        LIMIT 1
    );
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Schema created successfully!' as status;
SELECT 'Tables created: ' || COUNT(*) as result FROM information_schema.tables WHERE table_schema = 'public';
