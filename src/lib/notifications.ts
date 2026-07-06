import {
  AuditAction,
  NotificationStatus,
  NotificationType,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const resendEndpoint = "https://api.resend.com/emails";

function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() ?? "";
}

function getReplyTo() {
  return process.env.NOTIFICATION_REPLY_TO?.trim() || undefined;
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}

export function areEmailNotificationsEnabled() {
  return (
    process.env.NOTIFICATION_EMAILS_ENABLED === "true" &&
    Boolean(getResendApiKey()) &&
    Boolean(getEmailFrom())
  );
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 1000);
  }

  return "Unknown email provider error.";
}

async function writeNotificationAuditLog(input: {
  action: AuditAction;
  companyId: string;
  metadata: Prisma.InputJsonValue;
}) {
  try {
    await writeAuditLog(input);
  } catch {
    // Notification audit logs must not block the business action.
  }
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  body: string;
}) {
  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: [input.to],
      subject: input.subject,
      text: input.body,
      reply_to: getReplyTo(),
    }),
  });

  const result = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.message ?? result.error ?? "Resend email failed.");
  }

  return result.id;
}

export async function sendEmailNotification(input: {
  companyId: string;
  recipientUserId?: string;
  recipientEmail: string;
  type: NotificationType;
  subject: string;
  body: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const notification = await prisma.notificationLog.create({
    data: {
      companyId: input.companyId,
      recipientUserId: input.recipientUserId,
      recipientEmail: input.recipientEmail,
      type: input.type,
      subject: input.subject,
      body: input.body,
      metadata: input.metadata,
      status: areEmailNotificationsEnabled()
        ? NotificationStatus.PENDING
        : NotificationStatus.SKIPPED,
      provider: "resend",
    },
  });

  if (!areEmailNotificationsEnabled()) {
    return notification;
  }

  try {
    const providerMessageId = await sendViaResend({
      to: input.recipientEmail,
      subject: input.subject,
      body: input.body,
    });

    const sentNotification = await prisma.notificationLog.update({
      where: {
        id: notification.id,
      },
      data: {
        status: NotificationStatus.SENT,
        providerMessageId,
        sentAt: new Date(),
      },
    });

    await writeNotificationAuditLog({
      action: AuditAction.NOTIFICATION_EMAIL_SENT,
      companyId: input.companyId,
      metadata: {
        notificationId: notification.id,
        recipientUserId: input.recipientUserId,
        type: input.type,
      },
    });

    return sentNotification;
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    const failedNotification = await prisma.notificationLog.update({
      where: {
        id: notification.id,
      },
      data: {
        status: NotificationStatus.FAILED,
        errorMessage,
      },
    });

    await writeNotificationAuditLog({
      action: AuditAction.NOTIFICATION_EMAIL_FAILED,
      companyId: input.companyId,
      metadata: {
        notificationId: notification.id,
        recipientUserId: input.recipientUserId,
        type: input.type,
        errorMessage,
      },
    });

    return failedNotification;
  }
}

export async function notifyCompanyUsers(input: {
  companyId: string;
  roles?: UserRole[];
  excludeUserId?: string;
  type: NotificationType;
  subject: string;
  body: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const recipients = await prisma.companyUser.findMany({
    where: {
      companyId: input.companyId,
      isActive: true,
      id: input.excludeUserId
        ? {
            not: input.excludeUserId,
          }
        : undefined,
      role: input.roles
        ? {
            in: input.roles,
          }
        : undefined,
    },
    select: {
      id: true,
      email: true,
    },
  });

  const results: Array<Awaited<ReturnType<typeof sendEmailNotification>> | null> =
    [];

  for (const recipient of recipients) {
    try {
      results.push(
        await sendEmailNotification({
          companyId: input.companyId,
          recipientUserId: recipient.id,
          recipientEmail: recipient.email,
          type: input.type,
          subject: input.subject,
          body: input.body,
          metadata: input.metadata,
        }),
      );
    } catch {
      // Email notification failures are tracked when possible and never block the main flow.
      results.push(null);
    }
  }

  return results;
}
