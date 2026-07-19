-- ============================================
-- FIX PASSWORD HASHES MIGRATION
-- ============================================
-- This script fixes the incorrect password hashes in the database.
-- The old hashes were generated with invalid passwords.
-- 
-- Admin credentials: abdulmalikmusba@gmail.com / admin123
-- Student credentials: student@innovasci.com / student123
-- ============================================

DO $$
DECLARE
    admin_user_id UUID;
    student_user_id UUID;
    
    -- Correct bcrypt hash for 'admin123' generated with bcryptjs (cost factor 12)
    correct_admin_hash TEXT := '$2b$12$sDtr4kYQ6WFJkpmRHF59i.Ls624UJXbX/WpGYHth6DNAMD9IpYhE.';
    
    -- Correct bcrypt hash for 'student123' generated with bcryptjs (cost factor 12)
    correct_student_hash TEXT := '$2b$12$AZKJfO4B2232diTb5gSP9evLPcjBWYSWa2SWHHEZpMaYQSjsMx7dm';
    
    admin_updated BOOLEAN := FALSE;
    student_updated BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Starting password hash fix...';
    
    -- Fix admin user password hash
    SELECT id INTO admin_user_id FROM users WHERE email = 'abdulmalikmusba@gmail.com';
    IF admin_user_id IS NOT NULL THEN
        UPDATE users SET "passwordHash" = correct_admin_hash WHERE id = admin_user_id;
        admin_updated := TRUE;
        RAISE NOTICE 'Admin user password hash updated for: abdulmalikmusba@gmail.com';
    ELSE
        RAISE NOTICE 'Admin user not found: abdulmalikmusba@gmail.com';
    END IF;
    
    -- Fix student user password hash
    SELECT id INTO student_user_id FROM users WHERE email = 'student@innovasci.com';
    IF student_user_id IS NOT NULL THEN
        UPDATE users SET "passwordHash" = correct_student_hash WHERE id = student_user_id;
        student_updated := TRUE;
        RAISE NOTICE 'Student user password hash updated for: student@innovasci.com';
    ELSE
        RAISE NOTICE 'Student user not found: student@innovasci.com';
    END IF;
    
    -- Summary
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'PASSWORD HASH FIX COMPLETE';
    RAISE NOTICE '==========================================';
    IF admin_updated THEN
        RAISE NOTICE '✓ Admin user updated (email: abdulmalikmusba@gmail.com, password: admin123)';
    END IF;
    IF student_updated THEN
        RAISE NOTICE '✓ Student user updated (email: student@innovasci.com, password: student123)';
    END IF;
    IF NOT admin_updated AND NOT student_updated THEN
        RAISE NOTICE 'No users were found to update.';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Uncomment the following to verify the updates:
-- SELECT email, role, status, "passwordHash" FROM users WHERE email IN ('abdulmalikmusba@gmail.com', 'student@innovasci.com');
