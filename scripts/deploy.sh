#!/bin/bash
set -e

# Resolve failed migrations (if any)
npx prisma migrate resolve --rolled-back 004_enhance_learning_paths 2>/dev/null || true
npx prisma migrate resolve --rolled-back 006_fix_schema_consistency 2>/dev/null || true
npx prisma migrate resolve --rolled-back 007_add_categories 2>/dev/null || true

# Deploy remaining migrations and build
npx prisma migrate deploy && next build
