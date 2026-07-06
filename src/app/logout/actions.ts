"use server";

import { redirect } from "next/navigation";
import { AuditAction } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { destroySession, getCurrentUser, getRequestContext } from "@/lib/auth";

export async function logoutAction() {
  const user = await getCurrentUser();
  const requestContext = await getRequestContext();

  if (user) {
    await writeAuditLog({
      action: AuditAction.LOGOUT,
      companyId: user.companyId,
      actorId: user.id,
      ...requestContext,
    });
  }

  await destroySession();
  redirect("/login");
}
