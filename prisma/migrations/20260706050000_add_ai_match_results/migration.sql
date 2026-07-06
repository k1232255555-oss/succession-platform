-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'AI_MATCH_RECALCULATED';

-- CreateTable
CREATE TABLE "AiMatchResult" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" TEXT[],
    "strengths" TEXT[],
    "concerns" TEXT[],
    "recommendation" TEXT NOT NULL,
    "expectedContribution" TEXT[],
    "cautionPoints" TEXT[],
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL DEFAULT '2026-07-06',
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "companyProfileUpdatedAt" TIMESTAMP(3) NOT NULL,
    "candidateProfileUpdatedAt" TIMESTAMP(3) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiMatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiMatchResult_companyId_candidateId_key" ON "AiMatchResult"("companyId", "candidateId");

-- CreateIndex
CREATE INDEX "AiMatchResult_companyId_score_idx" ON "AiMatchResult"("companyId", "score");

-- CreateIndex
CREATE INDEX "AiMatchResult_candidateId_idx" ON "AiMatchResult"("candidateId");

-- CreateIndex
CREATE INDEX "AiMatchResult_calculatedAt_idx" ON "AiMatchResult"("calculatedAt");

-- AddForeignKey
ALTER TABLE "AiMatchResult" ADD CONSTRAINT "AiMatchResult_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMatchResult" ADD CONSTRAINT "AiMatchResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SuccessorCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
