-- ============================================
-- Migration: Add Categories
-- ============================================

-- Create categories table
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- Add categoryId to courses table (nullable, with FK)
ALTER TABLE "courses" ADD COLUMN "categoryId" UUID;

-- Add foreign key constraint
ALTER TABLE "courses" 
ADD CONSTRAINT "courses_categoryId_fkey" 
FOREIGN KEY ("categoryId") 
REFERENCES "categories"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "courses_categoryId_idx" ON "courses"("categoryId");

-- ============================================
-- Seed initial categories (optional)
-- ============================================
INSERT INTO "categories" ("name", "slug", "icon", "color", "orderIndex", "isActive", "createdAt", "updatedAt")
VALUES 
    ('Web Development', 'web-development', '🌐', '#6366f1', 1, true, NOW(), NOW()),
    ('Mobile Development', 'mobile-development', '📱', '#ec4899', 2, true, NOW(), NOW()),
    ('Data Science', 'data-science', '📊', '#10b981', 3, true, NOW(), NOW()),
    ('Cloud Computing', 'cloud-computing', '☁️', '#3b82f6', 4, true, NOW(), NOW()),
    ('DevOps', 'devops', '🔄', '#f59e0b', 5, true, NOW(), NOW()),
    ('Cybersecurity', 'cybersecurity', '🔒', '#ef4444', 6, true, NOW(), NOW()),
    ('Artificial Intelligence', 'artificial-intelligence', '🤖', '#8b5cf6', 7, true, NOW(), NOW()),
    ('Programming Fundamentals', 'programming-fundamentals', '💻', '#14b8a6', 8, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
