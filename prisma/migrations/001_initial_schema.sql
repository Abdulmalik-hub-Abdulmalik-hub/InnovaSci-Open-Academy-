-- ============================================
-- INNOVASCI OPEN ACADEMY - DATABASE MIGRATION
-- With RLS Policies, Triggers, and Seed Data
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "user_roles" ur
        JOIN "roles" r ON r.id = ur.role_id
        JOIN "users" u ON u.id = ur.user_id
        WHERE u.id = current_setting('app.current_user_id', TRUE)::uuid
        AND r.name = 'SYSTEM_ADMIN'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Get current user role
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT r.name 
        FROM "users" u
        JOIN "user_roles" ur ON ur.user_id = u.id
        JOIN "roles" r ON r.id = ur.role_id
        WHERE u.id = current_setting('app.current_user_id', TRUE)::uuid
        LIMIT 1
    );
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for each table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
    BEFORE UPDATE ON learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_date();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_logs_updated_at
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Audit logging for sensitive actions
-- ============================================
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    audit_user_id UUID;
    audit_action TEXT;
    audit_module TEXT;
    audit_details JSON;
BEGIN
    -- Get current user from settings
    BEGIN
        audit_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        audit_user_id := NULL;
    END;
    
    -- Determine action based on operation
    IF TG_OP = 'INSERT' THEN
        audit_action := 'CREATE';
    ELSIF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
    ELSE
        audit_action := 'UPDATE';
    END IF;
    
    -- Set module name based on table
    audit_module := TG_TABLE_NAME;
    
    -- Build details
    IF TG_OP = 'DELETE' THEN
        audit_details := row_to_json(OLD);
    ELSE
        audit_details := row_to_json(NEW);
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        id, user_id, action, module, details, ip_address, 
        user_agent, status, created_at
    ) VALUES (
        uuid_generate_v4(),
        audit_user_id,
        audit_action,
        audit_module,
        audit_details,
        NULLIF(current_setting('app.request_ip', TRUE), ''),
        NULLIF(current_setting('app.request_user_agent', TRUE), ''),
        'success',
        CURRENT_TIMESTAMP
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY users_select_own ON users
    FOR SELECT USING (id = current_setting('app.current_user_id', TRUE)::uuid);

-- Users can update their own profile (except role)
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id', TRUE)::uuid)
    WITH CHECK (id = current_setting('app.current_user_id', TRUE)::uuid);

-- Only admins can manage users
CREATE POLICY users_admin_all ON users
    FOR ALL USING (is_admin() = TRUE);

-- Public can view users (for public profiles)
CREATE POLICY users_public_view ON users
    FOR SELECT USING (status = 'ACTIVE');

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY profiles_select_own ON profiles
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid);

CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE)::uuid)
    WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::uuid);

CREATE POLICY profiles_admin_all ON profiles
    FOR ALL USING (is_admin() = TRUE);

-- ============================================
-- COURSES POLICIES
-- ============================================

-- Public can view published courses
CREATE POLICY courses_public_view ON courses
    FOR SELECT USING (status = 'PUBLISHED' OR is_admin() = TRUE);

CREATE POLICY courses_admin_all ON courses
    FOR ALL USING (is_admin() = TRUE);

CREATE POLICY courses_instructor_manage ON courses
    FOR ALL USING (
        instructor_id IN (
            SELECT p.id FROM profiles p 
            JOIN user_roles ur ON ur.user_id = p.user_id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.user_id = current_setting('app.current_user_id', TRUE)::uuid
            AND r.name IN ('SYSTEM_ADMIN', 'INSTRUCTOR')
        )
    );

-- ============================================
-- LESSONS POLICIES
-- ============================================

CREATE POLICY lessons_public_view ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c 
            WHERE c.id = lessons.course_id 
            AND (c.status = 'PUBLISHED' OR is_admin() = TRUE)
        )
    );

CREATE POLICY lessons_admin_all ON lessons
    FOR ALL USING (is_admin() = TRUE);

-- ============================================
-- ENROLLMENTS POLICIES
-- ============================================

-- Users can view their own enrollments
CREATE POLICY enrollments_select_own ON enrollments
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

-- Users can create enrollments for themselves
CREATE POLICY enrollments_insert_own ON enrollments
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::uuid);

-- Users can update their own enrollments
CREATE POLICY enrollments_update_own ON enrollments
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY enrollments_admin_all ON enrollments
    FOR ALL USING (is_admin() = TRUE);

-- ============================================
-- LEARNING PROGRESS POLICIES
-- ============================================

CREATE POLICY progress_select_own ON learning_progress
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY progress_insert_own ON learning_progress
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::uuid);

CREATE POLICY progress_update_own ON learning_progress
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY progress_admin_all ON learning_progress
    FOR ALL USING (is_admin() = TRUE);

-- ============================================
-- CERTIFICATES POLICIES
-- ============================================

CREATE POLICY certificates_select_own ON certificates
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY certificates_admin_all ON certificates
    FOR ALL USING (is_admin() = TRUE);

-- Public can verify certificates by code
CREATE POLICY certificates_verify ON certificates
    FOR SELECT USING (TRUE);

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

CREATE POLICY payments_select_own ON payments
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY payments_insert_own ON payments
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY payments_admin_all ON payments
    FOR ALL USING (is_admin() = TRUE);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY notifications_select_own ON notifications
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY notifications_insert_admin ON notifications
    FOR INSERT WITH CHECK (is_admin() = TRUE);

CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only admins can view audit logs
CREATE POLICY audit_logs_admin_view ON audit_logs
    FOR SELECT USING (is_admin() = TRUE);

-- Audit logs are append-only
CREATE POLICY audit_logs_admin_all ON audit_logs
    FOR INSERT WITH CHECK (is_admin() = TRUE);

-- ============================================
-- WISHLISTS POLICIES
-- ============================================

CREATE POLICY wishlists_select_own ON wishlists
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY wishlists_insert_own ON wishlists
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::uuid);

CREATE POLICY wishlists_delete_own ON wishlists
    FOR DELETE USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

CREATE POLICY subscriptions_select_own ON subscriptions
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY subscriptions_admin_all ON subscriptions
    FOR ALL USING (is_admin() = TRUE);

-- ============================================
-- NEWSLETTER SUBSCRIBERS POLICIES
-- ============================================

CREATE POLICY subscribers_public_insert ON newsletter_subscribers
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY subscribers_select_admin ON newsletter_subscribers
    FOR SELECT USING (is_admin() = TRUE);

CREATE POLICY subscribers_update_own ON newsletter_subscribers
    FOR UPDATE USING (
        user_id = current_setting('app.current_user_id', TRUE)::uuid 
        OR is_admin() = TRUE
    );

-- ============================================
-- SYSTEM SETTINGS POLICIES
-- ============================================

CREATE POLICY system_settings_admin_all ON system_settings
    FOR ALL USING (is_admin() = TRUE);

CREATE POLICY system_settings_public_view ON system_settings
    FOR SELECT USING (is_public = TRUE);

-- ============================================
-- STORAGE FILES POLICIES
-- ============================================

CREATE POLICY storage_files_admin_all ON storage_files
    FOR ALL USING (is_admin() = TRUE);

-- Users can view public files
CREATE POLICY storage_files_public_view ON storage_files
    FOR SELECT USING (visibility = 'public');

-- ============================================
-- SUPPORT TICKETS POLICIES
-- ============================================

CREATE POLICY tickets_select_own ON support_tickets
    FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::uuid OR is_admin() = TRUE);

CREATE POLICY tickets_insert_public ON support_tickets
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY tickets_update_admin ON support_tickets
    FOR UPDATE USING (is_admin() = TRUE);

-- ============================================
-- ROLES & PERMISSIONS POLICIES
-- ============================================

CREATE POLICY roles_admin_all ON roles
    FOR ALL USING (is_admin() = TRUE);

CREATE POLICY permissions_admin_all ON permissions
    FOR ALL USING (is_admin() = TRUE);

CREATE POLICY role_permissions_admin_all ON role_permissions
    FOR ALL USING (is_admin() = TRUE);

CREATE POLICY user_roles_admin_all ON user_roles
    FOR ALL USING (is_admin() = TRUE);

-- ============================================
-- ADMIN ROUTE ACCESS CONSTRAINT
-- ============================================
-- This function restricts admin portal access
CREATE OR REPLACE FUNCTION can_access_admin_portal(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.email = user_email 
        AND r.name = 'SYSTEM_ADMIN'
        AND u.status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION is_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_role() TO PUBLIC;
GRANT EXECUTE ON FUNCTION can_access_admin_portal(TEXT) TO PUBLIC;
