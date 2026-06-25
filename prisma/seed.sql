-- ============================================
-- INNOVASCI OPEN ACADEMY - SEED DATA
-- Admin User: abdulmalikmusba@gmail.com
-- ============================================

-- ============================================
-- 1. CREATE SYSTEM ROLES
-- ============================================

INSERT INTO roles (id, name, description, "created_at") VALUES
    (uuid_generate_v4(), 'SYSTEM_ADMIN', 'Full system administration access', NOW()),
    (uuid_generate_v4(), 'INSTRUCTOR', 'Course instructor with content management access', NOW()),
    (uuid_generate_v4(), 'STUDENT', 'Standard learner account', NOW()),
    (uuid_generate_v4(), 'GUEST', 'Limited guest access', NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. CREATE SYSTEM PERMISSIONS
-- ============================================

-- User Management Permissions
INSERT INTO permissions (id, key, description, "created_at") VALUES
    (uuid_generate_v4(), 'users.view', 'View all users', NOW()),
    (uuid_generate_v4(), 'users.create', 'Create new users', NOW()),
    (uuid_generate_v4(), 'users.update', 'Update user information', NOW()),
    (uuid_generate_v4(), 'users.delete', 'Delete users', NOW()),
    (uuid_generate_v4(), 'users.suspend', 'Suspend user accounts', NOW())
ON CONFLICT (key) DO NOTHING;

-- Course Management Permissions
INSERT INTO permissions (id, key, description, "created_at") VALUES
    (uuid_generate_v4(), 'courses.view', 'View all courses', NOW()),
    (uuid_generate_v4(), 'courses.create', 'Create new courses', NOW()),
    (uuid_generate_v4(), 'courses.update', 'Update courses', NOW()),
    (uuid_generate_v4(), 'courses.delete', 'Delete courses', NOW()),
    (uuid_generate_v4(), 'courses.publish', 'Publish/unpublish courses', NOW()),
    (uuid_generate_v4(), 'courses.duplicate', 'Duplicate courses', NOW())
ON CONFLICT (key) DO NOTHING;

-- Video Management Permissions
INSERT INTO permissions (id, key, description, "created_at") VALUES
    (uuid_generate_v4(), 'videos.view', 'View all videos', NOW()),
    (uuid_generate_v4(), 'videos.upload', 'Upload new videos', NOW()),
    (uuid_generate_v4(), 'videos.update', 'Update video metadata', NOW()),
    (uuid_generate_v4(), 'videos.delete', 'Delete videos', NOW())
ON CONFLICT (key) DO NOTHING;

-- Certificate Permissions
INSERT INTO permissions (id, key, description, "created_at") VALUES
    (uuid_generate_v4(), 'certificates.view', 'View all certificates', NOW()),
    (uuid_generate_v4(), 'certificates.issue', 'Issue certificates', NOW()),
    (uuid_generate_v4(), 'certificates.revoke', 'Revoke certificates', NOW())
ON CONFLICT (key) DO NOTHING;

-- Payment Permissions
INSERT INTO permissions (id, key, description, "created_at") VALUES
    (uuid_generate_v4(), 'payments.view', 'View payment records', NOW()),
    (uuid_generate_v4(), 'payments.approve', 'Approve/reject payments', NOW()),
    (uuid_generate_v4(), 'payments.refund', 'Process refunds', NOW())
ON CONFLICT (key) DO NOTHING;

-- Settings Permissions
INSERT INTO permissions (id, key, description, "created_at") VALUES
    (uuid_generate_v4(), 'settings.view', 'View system settings', NOW()),
    (uuid_generate_v4(), 'settings.update', 'Update system settings', NOW()),
    (uuid_generate_v4(), 'settings.maintenance', 'Enable maintenance mode', NOW())
ON CONFLICT (key) DO NOTHING;

-- Audit Permissions
INSERT INTO permissions (id, key, description, "created_at") VALUES
    (uuid_generate_v4(), 'audit.view', 'View audit logs', NOW()),
    (uuid_generate_v4(), 'audit.export', 'Export audit logs', NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 3. ASSIGN ALL PERMISSIONS TO SYSTEM_ADMIN
-- ============================================

INSERT INTO role_permissions (id, "role_id", "permission_id", "created_at")
SELECT 
    uuid_generate_v4(),
    r.id,
    p.id,
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SYSTEM_ADMIN'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- ============================================
-- 4. CREATE ADMIN USER AND PROFILE
-- ============================================

DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
    admin_profile_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id FROM users WHERE email = 'abdulmalikmusba@gmail.com';
    
    -- If not, create the user
    IF admin_user_id IS NULL THEN
        admin_user_id := uuid_generate_v4();
        
        INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES
            (admin_user_id, 'abdulmalikmusba@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5iHJ4j.S4IXTK', 'SYSTEM_ADMIN', 'ACTIVE', NOW(), NOW());
    ELSE
        -- Update existing user to be admin
        UPDATE users SET role = 'SYSTEM_ADMIN', status = 'ACTIVE' WHERE id = admin_user_id;
    END IF;
    
    -- Get or create SYSTEM_ADMIN role
    SELECT id INTO admin_role_id FROM roles WHERE name = 'SYSTEM_ADMIN';
    
    -- Assign admin role to user
    INSERT INTO user_roles (id, user_id, role_id, created_at)
    VALUES (uuid_generate_v4(), admin_user_id, admin_role_id, NOW())
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Check if profile exists
    SELECT id INTO admin_profile_id FROM profiles WHERE user_id = admin_user_id;
    
    -- Create or update admin profile
    IF admin_profile_id IS NULL THEN
        INSERT INTO profiles (
            id, user_id, full_name, username, bio, 
            two_factor_enabled, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            admin_user_id,
            'Abdulmalik Musba',
            'abdulmalik',
            'System Administrator at InnovaSci Open Academy',
            false,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            full_name = 'Abdulmalik Musba',
            username = 'abdulmalik',
            bio = 'System Administrator at InnovaSci Open Academy';
    ELSE
        UPDATE profiles SET
            full_name = 'Abdulmalik Musba',
            username = 'abdulmalik',
            bio = 'System Administrator at InnovaSci Open Academy'
        WHERE id = admin_profile_id;
    END IF;
    
    RAISE NOTICE 'Admin user setup completed successfully';
END $$;

-- ============================================
-- 5. CREATE DEMO STUDENT USER AND PROFILE
-- ============================================

DO $$
DECLARE
    student_user_id UUID;
    student_profile_id UUID;
    student_role_id UUID;
BEGIN
    -- Check if student user already exists
    SELECT id INTO student_user_id FROM users WHERE email = 'student@innovasci.com';
    
    -- If not, create the student user
    IF student_user_id IS NULL THEN
        student_user_id := uuid_generate_v4();
        
        INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES
            (student_user_id, 'student@innovasci.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT', 'ACTIVE', NOW(), NOW());
    ELSE
        UPDATE users SET role = 'STUDENT', status = 'ACTIVE' WHERE id = student_user_id;
    END IF;
    
    -- Get or create STUDENT role
    SELECT id INTO student_role_id FROM roles WHERE name = 'STUDENT';
    
    -- Assign student role to user
    INSERT INTO user_roles (id, user_id, role_id, created_at)
    VALUES (uuid_generate_v4(), student_user_id, student_role_id, NOW())
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Check if profile exists
    SELECT id INTO student_profile_id FROM profiles WHERE user_id = student_user_id;
    
    -- Create or update student profile
    IF student_profile_id IS NULL THEN
        INSERT INTO profiles (
            id, user_id, full_name, username, bio, 
            two_factor_enabled, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            student_user_id,
            'Demo Student',
            'demostudent',
            'A student exploring scientific computing courses',
            false,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            full_name = 'Demo Student',
            username = 'demostudent',
            bio = 'A student exploring scientific computing courses';
    END IF;
    
    RAISE NOTICE 'Demo student setup completed successfully';
END $$;

-- ============================================
-- 6. LOG ADMIN CREATION IN AUDIT LOG
-- ============================================

INSERT INTO audit_logs (id, user_id, action, module, details, created_at)
SELECT 
    uuid_generate_v4(),
    id,
    'CREATE',
    'users',
    jsonb_build_object(
        'email', 'abdulmalikmusba@gmail.com',
        'role', 'SYSTEM_ADMIN',
        'action', 'Initial admin setup'
    ),
    NOW()
FROM users WHERE email = 'abdulmalikmusba@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. SEED SUBSCRIPTION PLANS
-- ============================================

INSERT INTO subscription_plans (id, name, slug, description, billing_cycle, price_monthly, price_annual, features, limits, is_active, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), 'Free', 'free', 'Get started with basic learning', 'monthly', 0, 0, 
     '["Access to free courses", "Community forum access", "Basic progress tracking", "Email support"]'::jsonb,
     '{"maxCourses": 5, "certificates": false, "downloads": false}'::jsonb,
     true, NOW(), NOW()),
    
    (uuid_generate_v4(), 'Pro', 'pro', 'Everything you need to master scientific computing', 'monthly', 29, 24,
     '["Access to all courses", "Community forum access", "Advanced progress tracking", "Priority email support", "Certificate of completion", "Downloadable resources"]'::jsonb,
     '{"maxCourses": -1, "certificates": true, "downloads": true}'::jsonb,
     true, NOW(), NOW()),
    
    (uuid_generate_v4(), 'Team', 'team', 'For teams and organizations', 'monthly', 79, 65,
     '["Everything in Pro", "Team management dashboard", "Collaborative learning", "24/7 phone support", "Custom certificates", "Offline downloads", "Dedicated account manager", "Custom learning paths"]'::jsonb,
     '{"maxCourses": -1, "certificates": true, "downloads": true, "teamMembers": -1}'::jsonb,
     true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 8. SEED LEARNING PATHS
-- ============================================

INSERT INTO learning_paths (id, name, slug, description, is_published, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), 'Data Science Foundations', 'data-science-foundations', 'Master the fundamentals of data science with this comprehensive learning path', true, NOW(), NOW()),
    (uuid_generate_v4(), 'Computational Biology Track', 'computational-biology-track', 'Explore the intersection of biology and computing', true, NOW(), NOW()),
    (uuid_generate_v4(), 'Machine Learning Engineer', 'ml-engineer', 'Become a machine learning engineer from scratch', true, NOW(), NOW()),
    (uuid_generate_v4(), 'Fundamentals', 'fundamentals', 'Master the core concepts every scientist and developer needs', true, NOW(), NOW()),
    (uuid_generate_v4(), 'Front-end Development', 'frontend', 'Build beautiful, responsive web interfaces', true, NOW(), NOW()),
    (uuid_generate_v4(), 'Back-end Development', 'backend', 'Build robust APIs and data systems', true, NOW(), NOW()),
    (uuid_generate_v4(), 'Research Methods', 'research', 'Scientific computing and research tools', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

SELECT 'roles' as table_name, COUNT(*) as row_count FROM roles
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM learning_paths;
