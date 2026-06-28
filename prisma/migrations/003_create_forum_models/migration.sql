-- Create forum_threads table
CREATE TABLE "forum_threads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL DEFAULT 'general',
    "authorId" UUID NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "lastReplyAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_threads_pkey" PRIMARY KEY ("id")
);

-- Create forum_replies table
CREATE TABLE "forum_replies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_authorId_fkey" 
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_authorId_fkey" 
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_threadId_fkey" 
    FOREIGN KEY ("threadId") REFERENCES "forum_threads"("id") ON DELETE CASCADE;

-- Create indexes
CREATE INDEX "forum_threads_category_idx" ON "forum_threads"("category");
CREATE INDEX "forum_threads_authorId_idx" ON "forum_threads"("authorId");
CREATE INDEX "forum_threads_createdAt_idx" ON "forum_threads"("createdAt");
CREATE INDEX "forum_threads_isPinned_idx" ON "forum_threads"("isPinned");

CREATE INDEX "forum_replies_threadId_idx" ON "forum_replies"("threadId");
CREATE INDEX "forum_replies_authorId_idx" ON "forum_replies"("authorId");
CREATE INDEX "forum_replies_createdAt_idx" ON "forum_replies"("createdAt");