-- Add missing columns to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "verificationUrl" TEXT;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "roleId" VARCHAR(255);
