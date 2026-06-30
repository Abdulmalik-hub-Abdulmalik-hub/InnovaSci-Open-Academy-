-- Add missing columns to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "verificationUrl" TEXT;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "roleId" VARCHAR(255);

-- Fix emailVerified column type (convert BOOLEAN to TIMESTAMP)
DO $$
BEGIN
    -- Check if emailVerified is boolean and needs conversion
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'emailVerified' 
        AND data_type = 'boolean'
    ) THEN
        -- Add a new column with correct type
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerifiedNew" TIMESTAMP;
        -- Copy values (true = now, false = null)
        UPDATE users SET "emailVerifiedNew" = NOW() WHERE "emailVerified" = true;
        -- Drop old column and rename new one
        ALTER TABLE users DROP COLUMN IF EXISTS "emailVerified";
        ALTER TABLE users RENAME COLUMN "emailVerifiedNew" TO "emailVerified";
        RAISE NOTICE 'Fixed emailVerified column type';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'emailVerified fix skipped: %', SQLERRM;
END $$;
