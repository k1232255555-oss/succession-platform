-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SCOUT_CREATED', 'MESSAGE_SENT', 'BILLING_PAYMENT_FAILED', 'MESSAGE_THREAD_CLOSED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'NOTIFICATION_EMAIL_SENT';
ALTER TYPE "AuditAction" ADD VALUE 'NOTIFICATION_EMAIL_FAILED';

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationLog_companyId_createdAt_idx" ON "NotificationLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_recipientUserId_idx" ON "NotificationLog"("recipientUserId");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "NotificationLog_type_idx" ON "NotificationLog"("type");

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "CompanyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
