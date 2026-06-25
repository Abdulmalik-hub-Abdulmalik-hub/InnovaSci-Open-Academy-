-- ============================================
-- INNOVASCI OPEN ACADEMY - SEED DATA
-- Run this AFTER setup.sql to seed initial data
-- Can be run multiple times safely
-- ============================================

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
-- SEED DATA - SUBSCRIPTION PLANS
-- ============================================

INSERT INTO subscription_plans (id, name, slug, description, "billingCycle", "priceMonthly", "priceAnnual", features, limits, "isActive", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Free', 'free', 'Get started with basic learning', 'monthly', 0, 0, 
     '["Access to free courses", "Basic progress tracking"]'::jsonb,
     '{"maxCourses": 5}'::jsonb,
     true, NOW(), NOW()),
    
    (gen_random_uuid(), 'Pro', 'pro', 'Everything you need for scientific learning', 'monthly', 29, 24,
     '["Access to all courses", "Certificates", "Priority support"]'::jsonb,
     '{"maxCourses": -1}'::jsonb,
     true, NOW(), NOW()),
    
    (gen_random_uuid(), 'Team', 'team', 'For teams and organizations', 'monthly', 79, 65,
     '["Everything in Pro", "Team dashboard", "24/7 support"]'::jsonb,
     '{"maxCourses": -1}'::jsonb,
     true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA - LEARNING PATHS
-- ============================================

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

SELECT 'Seed Complete!' as status;
SELECT 'Users: ' || COUNT(*) as result FROM users
UNION ALL SELECT 'Profiles: ' || COUNT(*) FROM profiles
UNION ALL SELECT 'Learning Paths: ' || COUNT(*) FROM learning_paths
UNION ALL SELECT 'Subscription Plans: ' || COUNT(*) FROM subscription_plans;
