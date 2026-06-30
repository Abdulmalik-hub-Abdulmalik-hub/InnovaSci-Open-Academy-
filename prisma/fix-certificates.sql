-- Add missing columns to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS "verificationUrl" TEXT;
