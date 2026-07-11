-- Migration: Add Domains
-- Created: 2025-01-01
-- Description: Adds Domain model and updates Category model with domain relationship

-- ============================================
-- Create domains table
-- ============================================
CREATE TABLE IF NOT EXISTS "domains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "shortName" VARCHAR,
    "slug" VARCHAR NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "thumbnailUrl" VARCHAR,
    "bannerUrl" VARCHAR,
    "icon" VARCHAR,
    "color" VARCHAR,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR NOT NULL DEFAULT 'DRAFT',
    "visibility" VARCHAR NOT NULL DEFAULT 'PUBLIC',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" VARCHAR,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "domains_name_key" UNIQUE ("name"),
    CONSTRAINT "domains_slug_key" UNIQUE ("slug"),
    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- Create indexes for domains
CREATE INDEX IF NOT EXISTS "domains_slug_idx" ON "domains"("slug");
CREATE INDEX IF NOT EXISTS "domains_status_idx" ON "domains"("status");
CREATE INDEX IF NOT EXISTS "domains_visibility_idx" ON "domains"("visibility");
CREATE INDEX IF NOT EXISTS "domains_isFeatured_idx" ON "domains"("isFeatured");

-- ============================================
-- Update categories table with domain relationship
-- ============================================
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "domainId" UUID;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "thumbnailUrl" VARCHAR;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "bannerUrl" VARCHAR;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "status" VARCHAR NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "visibility" VARCHAR NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seoTitle" VARCHAR;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seoKeywords" TEXT;

-- Add foreign key constraint for domainId
ALTER TABLE "categories" ADD CONSTRAINT "categories_domainId_fkey" 
    FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE SET NULL;

-- Create indexes for categories
CREATE INDEX IF NOT EXISTS "categories_domainId_idx" ON "categories"("domainId");

-- Create unique constraint for slug within domain
CREATE UNIQUE INDEX IF NOT EXISTS "categories_domainId_slug_unique" ON "categories"("domainId", "slug") WHERE "domainId" IS NOT NULL;

-- Create unique constraint for name within domain
CREATE UNIQUE INDEX IF NOT EXISTS "categories_domainId_name_unique" ON "categories"("domainId", "name") WHERE "domainId" IS NOT NULL;

-- ============================================
-- Add migration lock
-- ============================================
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
