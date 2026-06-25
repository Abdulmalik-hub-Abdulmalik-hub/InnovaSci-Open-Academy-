-- ============================================
-- INNOVASCI OPEN ACADEMY - SEED DATA
-- Only Admin and Student roles
-- Admin: abdulmalikmusba@gmail.com / admin123
-- Student: student@innovasci.com / student123
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
    SELECT id INTO admin_user_id FROM users WHERE email = 'abdulmalikmusba@gmail.com';
    
    IF admin_user_id IS NULL THEN
        admin_user_id := gen_random_uuid();
        INSERT INTO users (id, email, "passwordHash", role, status, "createdAt", "updatedAt") VALUES
            (admin_user_id, 'abdulmalikmusba@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5iHJ4j.S4IXTK', 'ADMIN', 'ACTIVE', NOW(), NOW());
    ELSE
        UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE id = admin_user_id;
    END IF;
    
    SELECT id INTO admin_profile_id FROM profiles WHERE "userId" = admin_user_id;
    
    IF admin_profile_id IS NULL THEN
        INSERT INTO profiles (id, "userId", "fullName", username, bio, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), admin_user_id, 'Admin User', 'admin', 'Platform Administrator', 'active', NOW(), NOW());
    ELSE
        UPDATE profiles SET "fullName" = 'Admin User', username = 'admin', bio = 'Platform Administrator'
        WHERE id = admin_profile_id;
    END IF;
    
    RAISE NOTICE 'Admin setup completed';
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
    ELSE
        UPDATE users SET role = 'STUDENT', status = 'ACTIVE' WHERE id = student_user_id;
    END IF;
    
    SELECT id INTO student_profile_id FROM profiles WHERE "userId" = student_user_id;
    
    IF student_profile_id IS NULL THEN
        INSERT INTO profiles (id, "userId", "fullName", username, bio, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), student_user_id, 'Demo Student', 'demostudent', 'A learning enthusiast', 'active', NOW(), NOW());
    ELSE
        UPDATE profiles SET "fullName" = 'Demo Student', username = 'demostudent', bio = 'A learning enthusiast'
        WHERE id = student_profile_id;
    END IF;
    
    RAISE NOTICE 'Student setup completed';
END $$;

-- ============================================
-- SEED DATA - SUBSCRIPTION PLANS
-- ============================================

INSERT INTO subscriptions (id, "userId", plan, status, "startDate", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    id,
    'FREE',
    'active',
    NOW(),
    NOW(),
    NOW()
FROM users WHERE email = 'student@innovasci.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Seed Complete!' as status;
SELECT 'Users: ' || COUNT(*) as result FROM users
UNION ALL SELECT 'Profiles: ' || COUNT(*) FROM profiles;
