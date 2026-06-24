-- ============================================
-- INNOVASCI OPEN ACADEMY - SEED DATA
-- Admin User: abdulmalikmusba@gmail.com
-- ============================================

-- ============================================
-- 1. CREATE SYSTEM ROLES
-- ============================================

INSERT INTO roles (id, name, description, "isSystem", "createdAt", "updatedAt") VALUES
    (uuid_generate_v4(), 'SYSTEM_ADMIN', 'Full system administration access', true, NOW(), NOW()),
    (uuid_generate_v4(), 'INSTRUCTOR', 'Course instructor with content management access', true, NOW(), NOW()),
    (uuid_generate_v4(), 'STUDENT', 'Standard learner account', true, NOW(), NOW()),
    (uuid_generate_v4(), 'GUEST', 'Limited guest access', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. CREATE SYSTEM PERMISSIONS
-- ============================================

-- User Management Permissions
INSERT INTO permissions (id, key, description, module, action, "createdAt") VALUES
    (uuid_generate_v4(), 'users.view', 'View all users', 'users', 'read', NOW()),
    (uuid_generate_v4(), 'users.create', 'Create new users', 'users', 'create', NOW()),
    (uuid_generate_v4(), 'users.update', 'Update user information', 'users', 'update', NOW()),
    (uuid_generate_v4(), 'users.delete', 'Delete users', 'users', 'delete', NOW()),
    (uuid_generate_v4(), 'users.suspend', 'Suspend user accounts', 'users', 'update', NOW()),
ON CONFLICT (key) DO NOTHING;

-- Course Management Permissions
INSERT INTO permissions (id, key, description, module, action, "createdAt") VALUES
    (uuid_generate_v4(), 'courses.view', 'View all courses', 'courses', 'read', NOW()),
    (uuid_generate_v4(), 'courses.create', 'Create new courses', 'courses', 'create', NOW()),
    (uuid_generate_v4(), 'courses.update', 'Update courses', 'courses', 'update', NOW()),
    (uuid_generate_v4(), 'courses.delete', 'Delete courses', 'courses', 'delete', NOW()),
    (uuid_generate_v4(), 'courses.publish', 'Publish/unpublish courses', 'courses', 'update', NOW()),
    (uuid_generate_v4(), 'courses.duplicate', 'Duplicate courses', 'courses', 'create', NOW())
ON CONFLICT (key) DO NOTHING;

-- Video Management Permissions
INSERT INTO permissions (id, key, description, module, action, "createdAt") VALUES
    (uuid_generate_v4(), 'videos.view', 'View all videos', 'videos', 'read', NOW()),
    (uuid_generate_v4(), 'videos.upload', 'Upload new videos', 'videos', 'create', NOW()),
    (uuid_generate_v4(), 'videos.update', 'Update video metadata', 'videos', 'update', NOW()),
    (uuid_generate_v4(), 'videos.delete', 'Delete videos', 'videos', 'delete', NOW())
ON CONFLICT (key) DO NOTHING;

-- Certificate Permissions
INSERT INTO permissions (id, key, description, module, action, "createdAt") VALUES
    (uuid_generate_v4(), 'certificates.view', 'View all certificates', 'certificates', 'read', NOW()),
    (uuid_generate_v4(), 'certificates.issue', 'Issue certificates', 'certificates', 'create', NOW()),
    (uuid_generate_v4(), 'certificates.revoke', 'Revoke certificates', 'certificates', 'update', NOW())
ON CONFLICT (key) DO NOTHING;

-- Payment Permissions
INSERT INTO permissions (id, key, description, module, action, "createdAt") VALUES
    (uuid_generate_v4(), 'payments.view', 'View payment records', 'payments', 'read', NOW()),
    (uuid_generate_v4(), 'payments.approve', 'Approve/reject payments', 'payments', 'update', NOW()),
    (uuid_generate_v4(), 'payments.refund', 'Process refunds', 'payments', 'update', NOW())
ON CONFLICT (key) DO NOTHING;

-- Settings Permissions
INSERT INTO permissions (id, key, description, module, action, "createdAt") VALUES
    (uuid_generate_v4(), 'settings.view', 'View system settings', 'settings', 'read', NOW()),
    (uuid_generate_v4(), 'settings.update', 'Update system settings', 'settings', 'update', NOW()),
    (uuid_generate_v4(), 'settings.maintenance', 'Enable maintenance mode', 'settings', 'update', NOW())
ON CONFLICT (key) DO NOTHING;

-- Audit Permissions
INSERT INTO permissions (id, key, description, module, action, "createdAt") VALUES
    (uuid_generate_v4(), 'audit.view', 'View audit logs', 'audit', 'read', NOW()),
    (uuid_generate_v4(), 'audit.export', 'Export audit logs', 'audit', 'read', NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 3. ASSIGN ALL PERMISSIONS TO SYSTEM_ADMIN
-- ============================================

INSERT INTO role_permissions (id, "roleId", "permissionId", "createdAt")
SELECT 
    uuid_generate_v4(),
    r.id,
    p.id,
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SYSTEM_ADMIN'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- ============================================
-- 4. CREATE ADMIN USER
-- ============================================

-- First, create the user
INSERT INTO users (id, email, "passwordHash", role, status, "emailVerified", "createdAt", "updatedAt") VALUES
    (uuid_generate_v4(), 'abdulmalikmusba@gmail.com', '$2b$12$YOUR_HASH_HERE_REPLACE_WITH_ACTUAL_HASH', 'SYSTEM_ADMIN', 'ACTIVE', NOW(), NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    role = 'SYSTEM_ADMIN',
    status = 'ACTIVE';

-- Get the admin user ID
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE email = 'abdulmalikmusba@gmail.com';
    
    -- Get SYSTEM_ADMIN role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'SYSTEM_ADMIN';
    
    -- Assign admin role to user
    INSERT INTO user_roles (id, "userId", "roleId", "createdAt")
    VALUES (uuid_generate_v4(), admin_user_id, admin_role_id, NOW())
    ON CONFLICT ("userId", "roleId") DO NOTHING;
    
    -- Create admin profile
    INSERT INTO profiles (
        id, "userId", "fullName", "username", "avatarUrl", "bio", 
        "twoFactorEnabled", "createdAt", "updatedAt"
    ) VALUES (
        uuid_generate_v4(),
        admin_user_id,
        'Abdulmalik Musba',
        'abdulmalik',
        NULL,
        'System Administrator at InnovaSci Open Academy',
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT ("userId") DO UPDATE SET
        "fullName" = 'Abdulmalik Musba',
        "username" = 'abdulmalik',
        "bio" = 'System Administrator at InnovaSci Open Academy';
    
    RAISE NOTICE 'Admin user created successfully: %', admin_user_id;
END $$;

-- ============================================
-- 5. LOG ADMIN CREATION IN AUDIT LOG
-- ============================================

INSERT INTO audit_logs (
    id, "userId", action, module, details, status, "createdAt"
) 
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
    'success',
    NOW()
FROM users WHERE email = 'abdulmalikmusba@gmail.com';

-- ============================================
-- 6. CREATE DEFAULT SYSTEM SETTINGS
-- ============================================

INSERT INTO system_settings (id, key, value, type, "group", "isPublic", "createdAt", "updatedAt") VALUES
    (uuid_generate_v4(), 'platform_name', 'InnovaSci Open Academy', 'string', 'general', true, NOW(), NOW()),
    (uuid_generate_v4(), 'platform_tagline', 'Democratizing Scientific Education', 'string', 'general', true, NOW(), NOW()),
    (uuid_generate_v4(), 'contact_email', 'support@innovasci.com', 'string', 'general', true, NOW(), NOW()),
    (uuid_generate_v4(), 'maintenance_mode', 'false', 'boolean', 'system', false, NOW(), NOW()),
    (uuid_generate_v4(), 'allow_registrations', 'true', 'boolean', 'system', false, NOW(), NOW()),
    (uuid_generate_v4(), 'default_user_role', 'STUDENT', 'string', 'system', false, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 7. VERIFY ADMIN CREATION
-- ============================================

SELECT 
    u.email,
    u.role,
    u.status,
    r.name as role_name,
    p."fullName",
    p.username,
    ur."createdAt" as role_assigned_at
FROM users u
LEFT JOIN user_roles ur ON ur."userId" = u.id
LEFT JOIN roles r ON r.id = ur."roleId"
LEFT JOIN profiles p ON p."userId" = u.id
WHERE u.email = 'abdulmalikmusba@gmail.com';
