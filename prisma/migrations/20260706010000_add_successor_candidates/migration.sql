-- CreateEnum
CREATE TYPE "CandidateReviewStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'CANDIDATE_VIEWED';
ALTER TYPE "AuditAction" ADD VALUE 'CANDIDATE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'CANDIDATE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'CANDIDATE_DELETED';

-- CreateTable
CREATE TABLE "SuccessorCandidate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "desiredIndustries" TEXT[],
    "skills" TEXT[],
    "career" TEXT NOT NULL,
    "selfPr" TEXT NOT NULL,
    "aiUsageLevel" INTEGER NOT NULL DEFAULT 3,
    "fieldExperienceLevel" INTEGER NOT NULL DEFAULT 3,
    "successionMotivationLevel" INTEGER NOT NULL DEFAULT 3,
    "reviewStatus" "CandidateReviewStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessorCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuccessorCandidate_companyId_reviewStatus_idx" ON "SuccessorCandidate"("companyId", "reviewStatus");

-- CreateIndex
CREATE INDEX "SuccessorCandidate_companyId_isFeatured_idx" ON "SuccessorCandidate"("companyId", "isFeatured");

-- CreateIndex
CREATE INDEX "SuccessorCandidate_companyId_region_idx" ON "SuccessorCandidate"("companyId", "region");

-- CreateIndex
CREATE INDEX "SuccessorCandidate_createdAt_idx" ON "SuccessorCandidate"("createdAt");

-- AddForeignKey
ALTER TABLE "SuccessorCandidate" ADD CONSTRAINT "SuccessorCandidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
