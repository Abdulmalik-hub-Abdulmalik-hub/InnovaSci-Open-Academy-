-- Migration: 008_add_project_submissions
-- Create project submissions and related tables

-- Project Submissions table
CREATE TABLE IF NOT EXISTS "project_submissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "courseId" UUID,
    "miniProjectId" UUID,
    "capstoneId" TEXT,
    "capstoneType" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "submissionUrl" TEXT,
    "fileUrls" JSONB,
    "screenshots" JSONB,
    "status" VARCHAR(50) DEFAULT 'DRAFT',
    "isLocked" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "projectType" VARCHAR(50) DEFAULT 'MINI_PROJECT',
    "grade" INTEGER,
    "gradeType" VARCHAR(50),
    "rubricId" UUID,
    "rubricScore" DECIMAL(10, 2) DEFAULT 0,
    "maxScore" DECIMAL(10, 2) DEFAULT 100,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP,
    "gradedAt" TIMESTAMP,
    "isFromMCCS" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_courseId_fkey" 
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL;

ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_miniProjectId_fkey" 
    FOREIGN KEY ("miniProjectId") REFERENCES "mini_projects"("id") ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS "project_submissions_userId_idx" ON "project_submissions"("userId");
CREATE INDEX IF NOT EXISTS "project_submissions_courseId_idx" ON "project_submissions"("courseId");
CREATE INDEX IF NOT EXISTS "project_submissions_miniProjectId_idx" ON "project_submissions"("miniProjectId");
CREATE INDEX IF NOT EXISTS "project_submissions_status_idx" ON "project_submissions"("status");
CREATE INDEX IF NOT EXISTS "project_submissions_capstoneType_idx" ON "project_submissions"("capstoneType");
CREATE INDEX IF NOT EXISTS "project_submissions_projectType_idx" ON "project_submissions"("projectType");

-- Submission Versions table
CREATE TABLE IF NOT EXISTS "submission_versions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "submissionId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "submissionUrl" TEXT,
    "demoUrl" TEXT,
    "reportUrl" TEXT,
    "videoUrl" TEXT,
    "fileUrls" JSONB,
    "screenshots" JSONB,
    "additionalLinks" JSONB,
    "notes" TEXT,
    "isLatest" BOOLEAN DEFAULT false,
    "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "submission_versions" ADD CONSTRAINT "submission_versions_submissionId_fkey" 
    FOREIGN KEY ("submissionId") REFERENCES "project_submissions"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "submission_versions_submissionId_versionNumber_idx" 
    ON "submission_versions"("submissionId", "versionNumber");
CREATE INDEX IF NOT EXISTS "submission_versions_submissionId_idx" ON "submission_versions"("submissionId");

-- Project Reviews table
CREATE TABLE IF NOT EXISTS "project_reviews" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "submissionId" UUID NOT NULL,
    "versionId" UUID,
    "reviewerId" UUID NOT NULL,
    "decision" VARCHAR(50) NOT NULL,
    "overallFeedback" TEXT,
    "reviewedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isLatest" BOOLEAN DEFAULT true,
    "timeSpentMinutes" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "project_reviews" ADD CONSTRAINT "project_reviews_submissionId_fkey" 
    FOREIGN KEY ("submissionId") REFERENCES "project_submissions"("id") ON DELETE CASCADE;

ALTER TABLE "project_reviews" ADD CONSTRAINT "project_reviews_reviewerId_fkey" 
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "project_reviews_submissionId_idx" ON "project_reviews"("submissionId");
CREATE INDEX IF NOT EXISTS "project_reviews_reviewerId_idx" ON "project_reviews"("reviewerId");

-- Project Feedback table
CREATE TABLE IF NOT EXISTS "project_feedback" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "reviewId" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "recommendation" VARCHAR(50),
    "referenceType" VARCHAR(50),
    "referenceId" TEXT,
    "referenceDetail" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "project_feedback" ADD CONSTRAINT "project_feedback_reviewId_fkey" 
    FOREIGN KEY ("reviewId") REFERENCES "project_reviews"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "project_feedback_reviewId_idx" ON "project_feedback"("reviewId");
CREATE INDEX IF NOT EXISTS "project_feedback_category_idx" ON "project_feedback"("category");

-- Project Scores table
CREATE TABLE IF NOT EXISTS "project_scores" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "reviewId" UUID NOT NULL,
    "rubricId" UUID NOT NULL,
    "criteriaName" VARCHAR(255) NOT NULL,
    "pointsAwarded" DECIMAL(10, 2) DEFAULT 0,
    "maxPoints" DECIMAL(10, 2) NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "project_scores" ADD CONSTRAINT "project_scores_reviewId_fkey" 
    FOREIGN KEY ("reviewId") REFERENCES "project_reviews"("id") ON DELETE CASCADE;

ALTER TABLE "project_scores" ADD CONSTRAINT "project_scores_rubricId_fkey" 
    FOREIGN KEY ("rubricId") REFERENCES "project_rubrics"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "project_scores_reviewId_rubricId_criteriaName_idx" 
    ON "project_scores"("reviewId", "rubricId", "criteriaName");
CREATE INDEX IF NOT EXISTS "project_scores_reviewId_idx" ON "project_scores"("reviewId");

-- Project Status History table
CREATE TABLE IF NOT EXISTS "project_status_history" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "submissionId" UUID NOT NULL,
    "previousStatus" VARCHAR(50),
    "newStatus" VARCHAR(50) NOT NULL,
    "changedBy" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_submissionId_fkey" 
    FOREIGN KEY ("submissionId") REFERENCES "project_submissions"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "project_status_history_submissionId_idx" ON "project_status_history"("submissionId");

-- Reviewer Assignments table
CREATE TABLE IF NOT EXISTS "reviewer_assignments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "submissionId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "assignedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" VARCHAR(255),
    "dueDate" TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'PENDING',
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_submissionId_fkey" 
    FOREIGN KEY ("submissionId") REFERENCES "project_submissions"("id") ON DELETE CASCADE;

ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_reviewerId_fkey" 
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "reviewer_assignments_submissionId_reviewerId_idx" 
    ON "reviewer_assignments"("submissionId", "reviewerId");
CREATE INDEX IF NOT EXISTS "reviewer_assignments_reviewerId_idx" ON "reviewer_assignments"("reviewerId");
CREATE INDEX IF NOT EXISTS "reviewer_assignments_status_idx" ON "reviewer_assignments"("status");

-- Project Comments table
CREATE TABLE IF NOT EXISTS "project_comments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "submissionId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT false,
    "referenceType" VARCHAR(50),
    "referenceId" TEXT,
    "parentId" UUID,
    "isResolved" BOOLEAN DEFAULT false,
    "resolvedBy" VARCHAR(255),
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_submissionId_fkey" 
    FOREIGN KEY ("submissionId") REFERENCES "project_submissions"("id") ON DELETE CASCADE;

ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_authorId_fkey" 
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "project_comments_submissionId_idx" ON "project_comments"("submissionId");
CREATE INDEX IF NOT EXISTS "project_comments_authorId_idx" ON "project_comments"("authorId");
CREATE INDEX IF NOT EXISTS "project_comments_parentId_idx" ON "project_comments"("parentId");

-- Project Rubrics table (if not exists)
CREATE TABLE IF NOT EXISTS "project_rubrics" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) DEFAULT 'MINI_PROJECT',
    "courseId" UUID,
    "difficultyLevel" VARCHAR(50),
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "isDefault" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Entries table (if not exists)
CREATE TABLE IF NOT EXISTS "portfolio_entries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "liveUrl" TEXT,
    "githubUrl" TEXT,
    "demoVideoUrl" TEXT,
    "techStack" TEXT[],
    "screenshots" JSONB,
    "demoVideo" TEXT,
    "rationale" TEXT,
    "visibility" VARCHAR(50) DEFAULT 'PRIVATE',
    "publicSlug" VARCHAR(255) UNIQUE,
    "linkedCourseId" UUID,
    "linkedMiniProjectId" UUID,
    "linkedCapstoneId" UUID,
    "isPublished" BOOLEAN DEFAULT false,
    "viewCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "portfolio_entries_userId_idx" ON "portfolio_entries"("userId");
CREATE INDEX IF NOT EXISTS "portfolio_entries_visibility_idx" ON "portfolio_entries"("visibility");
CREATE INDEX IF NOT EXISTS "portfolio_entries_publicSlug_idx" ON "portfolio_entries"("publicSlug");
