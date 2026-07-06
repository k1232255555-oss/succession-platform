-- CreateEnum
CREATE TYPE "ScoutStatus" AS ENUM ('DRAFT', 'SENT', 'IN_REVIEW', 'MEETING', 'ACCEPTED', 'DECLINED', 'CANCELED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'SCOUT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'SCOUT_UPDATED';

-- CreateTable
CREATE TABLE "ScoutRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "createdById" TEXT,
    "status" "ScoutStatus" NOT NULL DEFAULT 'SENT',
    "message" TEXT NOT NULL,
    "feeAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "proposedMeetingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoutRequest_companyId_status_idx" ON "ScoutRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "ScoutRequest_candidateId_idx" ON "ScoutRequest"("candidateId");

-- CreateIndex
CREATE INDEX "ScoutRequest_createdById_idx" ON "ScoutRequest"("createdById");

-- CreateIndex
CREATE INDEX "ScoutRequest_createdAt_idx" ON "ScoutRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "ScoutRequest" ADD CONSTRAINT "ScoutRequest_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SuccessorCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutRequest" ADD CONSTRAINT "ScoutRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutRequest" ADD CONSTRAINT "ScoutRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
