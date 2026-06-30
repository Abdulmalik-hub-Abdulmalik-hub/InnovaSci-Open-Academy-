-- Add missing columns to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "verificationUrl" TEXT;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "roleId" VARCHAR(255);

-- Fix emailVerified column type (convert BOOLEAN to TIMESTAMP)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'emailVerified' 
        AND data_type = 'boolean'
    ) THEN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerifiedNew" TIMESTAMP;
        UPDATE users SET "emailVerifiedNew" = NOW() WHERE "emailVerified" = true;
        ALTER TABLE users DROP COLUMN IF EXISTS "emailVerified";
        ALTER TABLE users RENAME COLUMN "emailVerifiedNew" TO "emailVerified";
    END IF;
END $$;

-- Add missing columns to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "planType" VARCHAR(50) DEFAULT 'subscription';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "billingCycle" VARCHAR(50) DEFAULT 'monthly';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "currency" VARCHAR(10) DEFAULT 'USD';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "pricing" JSONB;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "stripePriceId" VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "paystackPlanId" VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "features" JSONB DEFAULT '[]';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "discountPercentage" INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "promoCode" VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "maxCourses" INTEGER DEFAULT -1;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "maxCertificates" INTEGER DEFAULT -1;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "allowedCourseIds" TEXT[];
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "trialDays" INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create newsletter_campaigns table (with snake_case names)
CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    "recipientType" VARCHAR(50) DEFAULT 'all',
    "recipientCourseId" UUID,
    "scheduledAt" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "totalRecipients" INTEGER DEFAULT 0,
    "successfulSends" INTEGER DEFAULT 0,
    "failedSends" INTEGER DEFAULT 0,
    "createdBy" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create newsletter_subscribers table (with snake_case names)
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stored_files table
CREATE TABLE IF NOT EXISTS "stored_files" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "originalName" VARCHAR(255) NOT NULL,
    "storedName" VARCHAR(255) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" BIGINT DEFAULT 0,
    "mimeType" VARCHAR(100),
    "fileType" VARCHAR(50),
    "storageType" VARCHAR(50) DEFAULT 'local',
    folder VARCHAR(255),
    tags TEXT[],
    "courseId" UUID,
    "uploadedBy" UUID,
    "isOrphaned" BOOLEAN DEFAULT false,
    "lastAccessedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to audit_logs table
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "userId" UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "action" VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "module" VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "targetTable" VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "targetId" UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "query" TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "affectedRows" INTEGER DEFAULT 0;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "previousData" JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "newData" JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "details" JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "ipAddress" VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "success" BOOLEAN DEFAULT true;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "planId" UUID;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "planName" VARCHAR(100) DEFAULT 'FREE';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'active';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "recurringPrice" DECIMAL(10,2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "isPro" BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "autoRenew" BOOLEAN DEFAULT true;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "paystackSubscriptionCode" VARCHAR(100);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" VARCHAR(100);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to enrollments table
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "completed" BOOLEAN DEFAULT false;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "progressPercent" INTEGER DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "source" VARCHAR(50);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "couponCode" VARCHAR(100);

-- Add missing columns to support_tickets table
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "labels" TEXT[];
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "priority" VARCHAR(50) DEFAULT 'medium';
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "assignedTo" UUID;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP;
