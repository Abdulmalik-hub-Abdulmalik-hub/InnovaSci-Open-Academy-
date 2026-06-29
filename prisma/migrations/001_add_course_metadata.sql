-- ============================================
-- InnovaSci Open Academy - Migration 001
-- Add Course Metadata Fields
-- ============================================
-- Run this SQL in Supabase SQL Editor

-- Add introVideoUrl to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS intro_video_url TEXT;

-- Add index for faster lookups on slug
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- ============================================
-- InnovaSci Open Academy - Migration 002
-- Add Lesson Exercise Fields
-- ============================================

-- Add exercise fields to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS is_exercise BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS exercise_description TEXT,
ADD COLUMN IF NOT EXISTS exercise_files_url TEXT,
ADD COLUMN IF NOT EXISTS solution_video_url TEXT;

-- Add index for exercise lessons
CREATE INDEX IF NOT EXISTS idx_lessons_is_exercise ON lessons(is_exercise);

-- ============================================
-- InnovaSci Open Academy - Migration 003
-- Add Learning Path Tables
-- ============================================

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    difficulty_level TEXT,
    duration_hours INTEGER,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_path_courses junction table
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_path_id, course_id)
);

-- Create learning_path_progress table
CREATE TABLE IF NOT EXISTS learning_path_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, learning_path_id)
);

-- ============================================
-- InnovaSci Open Academy - Migration 004
-- Add Membership Plans Table
-- ============================================

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) DEFAULT 0,
    price_yearly DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status TEXT DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Sample Data for Testing
-- ============================================

-- Insert sample plans
INSERT INTO plans (name, slug, description, price_monthly, price_yearly, features, is_active, is_featured)
VALUES 
    ('Free', 'free', 'Access to free courses', 0, 0, '["Access to free courses", "Community forum access", "Basic support"]', true, false),
    ('Basic', 'basic', 'Access to all courses', 9.99, 99.99, '["Access to all courses", "Downloadable resources", "Priority support", "Certificates"]', true, false),
    ('Pro', 'pro', 'Premium learning experience', 19.99, 199.99, '["Access to all courses", "Downloadable resources", "1-on-1 mentorship", "Priority support", "Premium certificates", "Learning paths"]', true, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- Check courses table columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses';

-- Check lessons table columns  
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lessons';

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
