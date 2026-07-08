-- CreateEnum
CREATE TYPE "SuccessionStage" AS ENUM ('NOT_STARTED', 'ORGANIZING_INFORMATION', 'DISCUSSING_WITH_STAKEHOLDERS', 'SUCCESSOR_CANDIDATE_EXISTS', 'CONSIDERING_EXTERNAL_SUCCESSION', 'CONSIDERING_M_AND_A', 'CONSULTING_EXPERTS', 'PREPARING_TRANSITION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BriefVisibilityScope" AS ENUM ('PRIVATE', 'AGGREGATE_ONLY', 'SHARE_WITH_OPERATOR');

-- CreateEnum
CREATE TYPE "BriefStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'SUCCESSION_BRIEF_SUBMITTED';
ALTER TYPE "AuditAction" ADD VALUE 'SUCCESSION_BRIEF_REVIEWED';

-- CreateTable
CREATE TABLE "SuccessionBrief" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "industry" TEXT NOT NULL,
    "prefecture" TEXT,
    "businessSummary" VARCHAR(500),
    "successionStage" "SuccessionStage" NOT NULL,
    "visibilityScope" "BriefVisibilityScope" NOT NULL,
    "valueCategories" TEXT[],
    "stakeholderTypes" TEXT[],
    "issueCategories" TEXT[],
    "unresolvedItems" TEXT[],
    "nextActions" TEXT[],
    "status" "BriefStatus" NOT NULL DEFAULT 'SUBMITTED',
    "sensitiveInfoFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessionBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessionBriefContactRequest" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "message" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuccessionBriefContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuccessionBrief_createdByUserId_idx" ON "SuccessionBrief"("createdByUserId");

-- CreateIndex
CREATE INDEX "SuccessionBrief_visibilityScope_status_sensitiveInfoFlag_idx" ON "SuccessionBrief"("visibilityScope", "status", "sensitiveInfoFlag");

-- CreateIndex
CREATE INDEX "SuccessionBrief_industry_idx" ON "SuccessionBrief"("industry");

-- CreateIndex
CREATE INDEX "SuccessionBrief_prefecture_idx" ON "SuccessionBrief"("prefecture");

-- CreateIndex
CREATE INDEX "SuccessionBrief_successionStage_idx" ON "SuccessionBrief"("successionStage");

-- CreateIndex
CREATE INDEX "SuccessionBrief_createdAt_idx" ON "SuccessionBrief"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessionBriefContactRequest_briefId_key" ON "SuccessionBriefContactRequest"("briefId");

-- AddForeignKey
ALTER TABLE "SuccessionBrief" ADD CONSTRAINT "SuccessionBrief_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessionBriefContactRequest" ADD CONSTRAINT "SuccessionBriefContactRequest_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "SuccessionBrief"("id") ON DELETE CASCADE ON UPDATE CASCADE;
