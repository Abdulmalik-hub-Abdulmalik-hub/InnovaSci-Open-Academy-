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
