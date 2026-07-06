"use server";

import { redirect } from "next/navigation";
import { AuditAction } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { createSession, getRequestContext } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestContext = await getRequestContext();

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
    };
  }

  const user = await prisma.companyUser.findUnique({
    where: {
      email,
    },
    include: {
      company: true,
    },
  });

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    if (user) {
      await writeAuditLog({
        action: AuditAction.LOGIN_FAILED,
        companyId: user.companyId,
        actorId: user.id,
        ...requestContext,
        metadata: {
          email,
        },
      });
    }

    return {
      error: "メールアドレスまたはパスワードが正しくありません。",
    };
  }

  await prisma.companyUser.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  await createSession(user.id);

  await writeAuditLog({
    action: AuditAction.LOGIN_SUCCESS,
    companyId: user.companyId,
    actorId: user.id,
    ...requestContext,
  });

  redirect("/");
}
