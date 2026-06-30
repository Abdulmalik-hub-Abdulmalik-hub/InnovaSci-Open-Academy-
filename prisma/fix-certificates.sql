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
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "pricing" JSONB;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "stripePriceId" VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "paystackPlanId" VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "features" JSONB DEFAULT '[]';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "discountPercentage" INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "promoCode" VARCHAR(255);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "maxCourses" INTEGER DEFAULT -1;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "maxCertificates" INTEGER DEFAULT -1;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "allowedCourseIds" TEXT[];
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "trialDays" INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;
