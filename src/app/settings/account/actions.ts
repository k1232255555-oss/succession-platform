"use server";

import { redirect } from "next/navigation";
import { AuditAction } from "@prisma/client";
import {
  createSession,
  getRequestContext,
  requireSameOriginRequest,
  requireUser,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const passwordMinLength = 12;
const passwordMaxLength = 128;

function redirectWithError(message: string): never {
  redirect(`/settings/account?error=${encodeURIComponent(message)}`);
}

export async function changeOwnPasswordAction(formData: FormData) {
  await requireSameOriginRequest();

  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirectWithError("すべてのパスワード欄を入力してください。");
  }

  if (
    currentPassword.length > passwordMaxLength ||
    newPassword.length > passwordMaxLength ||
    confirmPassword.length > passwordMaxLength
  ) {
    redirectWithError("パスワードは128文字以内で入力してください。");
  }

  if (newPassword.length < passwordMinLength) {
    redirectWithError("新しいパスワードは12文字以上にしてください。");
  }

  if (newPassword !== confirmPassword) {
    redirectWithError("新しいパスワードと確認入力が一致しません。");
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    redirectWithError("現在のパスワードが正しくありません。");
  }

  if (verifyPassword(newPassword, user.passwordHash)) {
    redirectWithError("現在とは異なるパスワードを設定してください。");
  }

  const requestContext = await getRequestContext();

  await prisma.$transaction([
    prisma.companyUser.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: hashPassword(newPassword),
      },
    }),
    prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: AuditAction.USER_UPDATED,
        companyId: user.companyId,
        actorId: user.id,
        ...requestContext,
        metadata: {
          password_changed: true,
          sessions_revoked: true,
        },
      },
    }),
  ]);

  await createSession(user.id);

  redirect(
    `/settings/account?notice=${encodeURIComponent(
      "パスワードを変更し、ほかのログインセッションを終了しました。",
    )}`,
  );
}
