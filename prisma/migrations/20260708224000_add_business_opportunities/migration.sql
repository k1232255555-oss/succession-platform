-- CreateEnum
CREATE TYPE "BusinessOpportunityVisibility" AS ENUM ('PRIVATE', 'LIMITED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "BusinessOpportunityStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'BUSINESS_OPPORTUNITY_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'BUSINESS_OPPORTUNITY_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'BUSINESS_OPPORTUNITY_SUBMITTED_FOR_REVIEW';
ALTER TYPE "AuditAction" ADD VALUE 'BUSINESS_OPPORTUNITY_PUBLISHED';
ALTER TYPE "AuditAction" ADD VALUE 'BUSINESS_OPPORTUNITY_ARCHIVED';

-- CreateTable
CREATE TABLE "BusinessOpportunity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "title" VARCHAR(80) NOT NULL,
    "industry" TEXT NOT NULL,
    "region" TEXT,
    "summary" VARCHAR(500) NOT NULL,
    "strengths" TEXT[],
    "successionNeeds" TEXT[],
    "preferredSuccessorTypes" TEXT[],
    "visibility" "BusinessOpportunityVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "BusinessOpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "sensitiveInfoFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessOpportunity_companyId_idx" ON "BusinessOpportunity"("companyId");

-- CreateIndex
CREATE INDEX "BusinessOpportunity_createdById_idx" ON "BusinessOpportunity"("createdById");

-- CreateIndex
CREATE INDEX "BusinessOpportunity_visibility_status_idx" ON "BusinessOpportunity"("visibility", "status");

-- CreateIndex
CREATE INDEX "BusinessOpportunity_createdAt_idx" ON "BusinessOpportunity"("createdAt");

-- AddForeignKey
ALTER TABLE "BusinessOpportunity" ADD CONSTRAINT "BusinessOpportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessOpportunity" ADD CONSTRAINT "BusinessOpportunity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
