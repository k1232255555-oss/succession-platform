import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function formatAuditAction(action: AuditAction) {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function writeAuditLog(input: {
  action: AuditAction;
  companyId: string;
  actorId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      companyId: input.companyId,
      actorId: input.actorId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata,
    },
  });
}
