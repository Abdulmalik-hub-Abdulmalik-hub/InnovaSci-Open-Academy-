-- Migration: Add Payment Gateway Manager Tables
-- Created: 2025-07-13

-- ============================================
-- Payment Gateways Table
-- ============================================
CREATE TABLE IF NOT EXISTS "payment_gateways" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "provider" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL UNIQUE,
    "isEnabled" BOOLEAN DEFAULT false,
    "isDefault" BOOLEAN DEFAULT false,
    "environment" VARCHAR(50) DEFAULT 'sandbox',
    "logoUrl" TEXT,
    "iconName" VARCHAR(100),
    "color" VARCHAR(20),
    "publicKey" TEXT,
    "secretKey" TEXT,
    "webhookSecret" TEXT,
    "supportedCurrencies" TEXT[] DEFAULT '{}',
    "supportedCountries" TEXT[] DEFAULT '{}',
    "supportedMethods" TEXT[] DEFAULT '{}',
    "transactionFeePercent" DECIMAL(10, 2) DEFAULT 0,
    "transactionFeeFixed" DECIMAL(10, 2) DEFAULT 0,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "priority" INTEGER DEFAULT 100,
    "lastHealthCheck" TIMESTAMP,
    "healthStatus" VARCHAR(50) DEFAULT 'unknown',
    "healthMessage" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Gateway Configurations Table
-- ============================================
CREATE TABLE IF NOT EXISTS "gateway_configurations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "gatewayId" UUID NOT NULL REFERENCES "payment_gateways"("id") ON DELETE CASCADE,
    "country" VARCHAR(10) NOT NULL,
    "countryName" VARCHAR(255) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "isEnabled" BOOLEAN DEFAULT true,
    "priority" INTEGER DEFAULT 100,
    "config" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("gatewayId", "country", "currency")
);

-- ============================================
-- Payment Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS "payment_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "gatewayId" UUID NOT NULL REFERENCES "payment_gateways"("id"),
    "reference" VARCHAR(255) NOT NULL UNIQUE,
    "gatewayRef" VARCHAR(255),
    "userId" VARCHAR(255),
    "amount" DECIMAL(20, 2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "amountInBase" DECIMAL(20, 2),
    "exchangeRate" DECIMAL(20, 10) DEFAULT 1,
    "status" VARCHAR(50) DEFAULT 'pending',
    "purchaseType" VARCHAR(100),
    "purchaseId" VARCHAR(255),
    "metadata" JSONB,
    "gatewayResponse" JSONB,
    "paymentMethod" VARCHAR(50),
    "customerEmail" VARCHAR(255),
    "customerName" VARCHAR(255),
    "processingFee" DECIMAL(20, 2) DEFAULT 0,
    "platformFee" DECIMAL(20, 2) DEFAULT 0,
    "initiatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    "failedAt" TIMESTAMP,
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    "errorMessage" TEXT,
    "errorCode" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "payment_transactions_userId_idx" ON "payment_transactions"("userId");
CREATE INDEX IF NOT EXISTS "payment_transactions_gatewayId_idx" ON "payment_transactions"("gatewayId");
CREATE INDEX IF NOT EXISTS "payment_transactions_status_idx" ON "payment_transactions"("status");
CREATE INDEX IF NOT EXISTS "payment_transactions_createdAt_idx" ON "payment_transactions"("createdAt");

-- ============================================
-- Payment Gateway Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS "payment_gateway_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "gatewayId" UUID NOT NULL REFERENCES "payment_gateways"("id") ON DELETE CASCADE,
    "transactionId" VARCHAR(255),
    "logType" VARCHAR(50) NOT NULL,
    "level" VARCHAR(20) DEFAULT 'info',
    "method" VARCHAR(20),
    "endpoint" TEXT,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "responseStatus" INTEGER,
    "responseTime" INTEGER,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "ipAddress" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "payment_gateway_logs_gatewayId_idx" ON "payment_gateway_logs"("gatewayId");
CREATE INDEX IF NOT EXISTS "payment_gateway_logs_transactionId_idx" ON "payment_gateway_logs"("transactionId");
CREATE INDEX IF NOT EXISTS "payment_gateway_logs_logType_idx" ON "payment_gateway_logs"("logType");
CREATE INDEX IF NOT EXISTS "payment_gateway_logs_createdAt_idx" ON "payment_gateway_logs"("createdAt");

-- ============================================
-- Exchange Rates Table
-- ============================================
CREATE TABLE IF NOT EXISTS "exchange_rates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fromCurrency" VARCHAR(10) NOT NULL,
    "toCurrency" VARCHAR(10) NOT NULL,
    "rate" DECIMAL(20, 10) NOT NULL,
    "isAutomatic" BOOLEAN DEFAULT false,
    "provider" VARCHAR(100),
    "validFrom" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("fromCurrency", "toCurrency")
);

-- ============================================
-- Payment Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS "payment_settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "defaultGatewayId" VARCHAR(255),
    "defaultCurrency" VARCHAR(10) DEFAULT 'USD',
    "supportedCurrencies" TEXT[] DEFAULT '{"USD","NGN","EUR","GBP"}',
    "exchangeRateMode" VARCHAR(50) DEFAULT 'automatic',
    "autoUpdateRates" BOOLEAN DEFAULT true,
    "updateIntervalHours" INTEGER DEFAULT 24,
    "paymentTimeout" INTEGER DEFAULT 30,
    "retryAttempts" INTEGER DEFAULT 3,
    "refundEnabled" BOOLEAN DEFAULT true,
    "refundWindowDays" INTEGER DEFAULT 7,
    "webhookEnabled" BOOLEAN DEFAULT true,
    "webhookRetries" INTEGER DEFAULT 3,
    "invoicePrefix" VARCHAR(20) DEFAULT 'INV',
    "invoiceAutoNumber" BOOLEAN DEFAULT true,
    "receiptEnabled" BOOLEAN DEFAULT true,
    "receiptEmailEnabled" BOOLEAN DEFAULT true,
    "taxEnabled" BOOLEAN DEFAULT false,
    "taxRate" DECIMAL(10, 2) DEFAULT 0,
    "taxName" VARCHAR(100) DEFAULT 'Tax',
    "platformFeePercent" DECIMAL(10, 2) DEFAULT 0,
    "platformFeeFixed" DECIMAL(10, 2) DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Seed Default Payment Gateways
-- ============================================

-- Insert Paystack (enabled by default)
INSERT INTO "payment_gateways" ("name", "provider", "slug", "isEnabled", "isDefault", "environment", "iconName", "color", "supportedCurrencies", "supportedCountries", "supportedMethods", "transactionFeePercent", "currency", "priority", "notes")
VALUES 
    ('Paystack', 'paystack', 'paystack', true, true, 'production', 'CreditCard', '#00C4B4', 
     ARRAY['NGN', 'USD', 'GHS', 'KES', 'ZAR'], 
     ARRAY['NG', 'GH', 'KE', 'ZA', 'US', 'GB'], 
     ARRAY['card', 'bank_transfer', 'ussd', 'mobile_money'], 
     1.5, 'NGN', 1, 'Primary gateway for African payments. Supports NGN, USD, and African currencies.'),
    ('Stripe', 'stripe', 'stripe', false, false, 'production', 'CreditCard', '#635BFF', 
     ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'], 
     ARRAY['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NG'], 
     ARRAY['card', 'bank_transfer', 'apple_pay', 'google_pay'], 
     2.9, 'USD', 2, 'Global payment gateway. Best for USD and international payments.'),
    ('Flutterwave', 'flutterwave', 'flutterwave', false, false, 'production', 'CreditCard', '#F5A623', 
     ARRAY['NGN', 'USD', 'KES', 'GHS', 'UGX', 'XOF', 'ZAR'], 
     ARRAY['NG', 'KE', 'GH', 'UG', 'SN', 'CI', 'ZA', 'US', 'GB'], 
     ARRAY['card', 'bank_transfer', 'ussd', 'mobile_money', 'qr_code'], 
     1.4, 'NGN', 3, 'Pan-African payment gateway. Alternative to Paystack.'),
    ('PayPal', 'paypal', 'paypal', false, false, 'production', 'CreditCard', '#003087', 
     ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'], 
     ARRAY['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP'], 
     ARRAY['paypal', 'card'], 
     3.49, 'USD', 4, 'Global payment option. Popular for international transactions.'),
    ('Paddle', 'paddle', 'paddle', false, false, 'production', 'CreditCard', '#F5F5F5', 
     ARRAY['USD', 'EUR', 'GBP'], 
     ARRAY['US', 'GB', 'CA', 'AU', 'DE', 'FR'], 
     ARRAY['card', 'paypal', 'apple_pay', 'google_pay'], 
     5.0, 'USD', 5, 'Developer-friendly. Good for SaaS and digital products.'),
    ('Razorpay', 'razorpay', 'razorpay', false, false, 'production', 'CreditCard', '#0066FF', 
     ARRAY['INR', 'USD'], 
     ARRAY['IN', 'US', 'GB'], 
     ARRAY['card', 'bank_transfer', 'upi', 'wallet', 'emi'], 
     2.0, 'INR', 6, 'Indian payment gateway. Best for INR payments.'),
    ('Bank Transfer', 'bank_transfer', 'bank-transfer', false, false, 'production', 'Building', '#10B981', 
     ARRAY['NGN', 'USD', 'EUR', 'GBP'], 
     ARRAY['NG', 'US', 'GB', 'DE'], 
     ARRAY['bank_transfer'], 
     0, 'USD', 10, 'Manual bank transfer. Requires manual verification.'),
    ('Manual Payment', 'manual', 'manual-payment', false, false, 'production', 'FileText', '#6B7280', 
     ARRAY['NGN', 'USD', 'EUR', 'GBP'], 
     ARRAY['NG', 'US', 'GB', 'DE', 'FR'], 
     ARRAY['cash', 'cheque', 'other'], 
     0, 'USD', 100, 'Cash or cheque payment. Requires admin verification.'),
    ('Crypto Payments', 'crypto', 'crypto', false, false, 'production', 'Bitcoin', '#F7931A', 
     ARRAY['USD', 'EUR', 'BTC', 'ETH', 'USDT', 'USDC'], 
     ARRAY['US', 'GB', 'DE', 'FR'], 
     ARRAY['crypto'], 
     1.0, 'USD', 20, 'Cryptocurrency payments via Coinbase Commerce or similar.')
ON CONFLICT ("slug") DO NOTHING;

-- Seed default payment settings
INSERT INTO "payment_settings" ("defaultCurrency", "supportedCurrencies", "exchangeRateMode", "autoUpdateRates", "updateIntervalHours", "paymentTimeout", "retryAttempts", "refundEnabled", "refundWindowDays", "webhookEnabled", "webhookRetries", "invoicePrefix", "invoiceAutoNumber", "receiptEnabled", "receiptEmailEnabled")
VALUES ('USD', ARRAY['NGN', 'USD', 'EUR', 'GBP'], 'automatic', true, 24, 30, 3, true, 7, true, 3, 'INV', true, true, true)
ON CONFLICT DO NOTHING;

-- Seed exchange rates
INSERT INTO "exchange_rates" ("fromCurrency", "toCurrency", "rate", "isAutomatic")
VALUES 
    ('NGN', 'USD', 0.00065, false),
    ('EUR', 'USD', 1.10, false),
    ('GBP', 'USD', 1.27, false),
    ('CAD', 'USD', 0.74, false),
    ('AUD', 'USD', 0.65, false),
    ('JPY', 'USD', 0.0067, false),
    ('GHS', 'USD', 0.082, false),
    ('KES', 'USD', 0.0077, false),
    ('ZAR', 'USD', 0.053, false),
    ('INR', 'USD', 0.012, false)
ON CONFLICT ("fromCurrency", "toCurrency") DO NOTHING;

-- ============================================
-- Seed Scholarship Types (if not already seeded)
-- ============================================

-- Check if scholarship_types table exists and seed if needed
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scholarship_types') THEN
        INSERT INTO "scholarship_types" ("name", "slug", "description", "icon", "color", "isActive", "orderIndex")
        VALUES 
            ('Excellence Scholarship', 'excellence-scholarship', 'Recognizing outstanding academic achievement and exceptional performance in studies.', 'GraduationCap', '#8B5CF6', true, 1),
            ('Research & Innovation Scholarship', 'research-innovation-scholarship', 'Supporting students pursuing cutting-edge research in AI, drug discovery, and scientific innovation.', 'BookOpen', '#EC4899', true, 2),
            ('Opportunity Scholarship', 'opportunity-scholarship', 'Providing financial assistance and support for students with demonstrated need.', 'Heart', '#10B981', true, 3),
            ('Global Partnership Scholarship', 'global-partnership-scholarship', 'In partnership with governments, universities, and organizations worldwide.', 'Globe', '#3B82F6', true, 4),
            ('Leadership & Impact Scholarship', 'leadership-impact-scholarship', 'Recognizing future leaders with demonstrated commitment to community and entrepreneurship.', 'Star', '#F59E0B', true, 5),
            ('Custom Scholarship', 'custom-scholarship', 'Flexible scholarship programs tailored to specific donor requirements and student needs.', 'Sparkles', '#6366F1', true, 6)
        ON CONFLICT ("slug") DO NOTHING;
    END IF;
END $$;
