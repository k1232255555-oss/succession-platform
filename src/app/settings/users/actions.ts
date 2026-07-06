"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuditAction, UserRole } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import {
  canManageUsers,
  getRequestContext,
  requireUser,
} from "@/lib/auth";
import { getPlanConfig, isWithinLimit } from "@/lib/billing";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function parseRole(value: FormDataEntryValue | null, actorRole: UserRole) {
  const role = String(value ?? "");

  if (role === UserRole.ADMIN && actorRole === UserRole.OWNER) {
    return UserRole.ADMIN;
  }

  if (role === UserRole.MEMBER) {
    return UserRole.MEMBER;
  }

  if (role === UserRole.VIEWER) {
    return UserRole.VIEWER;
  }

  return UserRole.MEMBER;
}

async function ensureCanManageUsers() {
  const user = await requireUser();

  if (!canManageUsers(user)) {
    redirect("/");
  }

  return user;
}

async function ensureOwnerContinuity(input: {
  companyId: string;
  targetUserId: string;
  nextRole?: UserRole;
  nextActive?: boolean;
}) {
  const target = await prisma.companyUser.findFirst({
    where: {
      id: input.targetUserId,
      companyId: input.companyId,
    },
  });

  if (!target) {
    redirect("/settings/users?error=ユーザーが見つかりません。");
  }

  const wouldRemoveOwner =
    target.role === UserRole.OWNER &&
    (input.nextRole !== undefined || input.nextActive === false) &&
    (input.nextRole ?? target.role) !== UserRole.OWNER;

  const wouldDisableOwner =
    target.role === UserRole.OWNER && input.nextActive === false;

  if (!wouldRemoveOwner && !wouldDisableOwner) {
    return target;
  }

  const activeOwnerCount = await prisma.companyUser.count({
    where: {
      companyId: input.companyId,
      role: UserRole.OWNER,
      isActive: true,
    },
  });

  if (activeOwnerCount <= 1) {
    redirect(
      "/settings/users?error=最後のOWNERは降格または停止できません。",
    );
  }

  return target;
}

export async function createCompanyUserAction(formData: FormData) {
  const actor = await ensureCanManageUsers();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"), actor.role);

  if (!name || !email || password.length < 12) {
    redirect(
      "/settings/users?error=名前、メールアドレス、12文字以上の初期パスワードを入力してください。",
    );
  }

  const planConfig = getPlanConfig(actor.company.billingPlan);
  const activeUserCount = await prisma.companyUser.count({
    where: {
      companyId: actor.companyId,
      isActive: true,
    },
  });

  if (!isWithinLimit(activeUserCount, planConfig.limits.users)) {
    redirect(
      `/settings/users?error=${encodeURIComponent(
        "現在のプランで作成できるユーザー数の上限に達しています。",
      )}`,
    );
  }

  const created = await prisma.companyUser.create({
    data: {
      companyId: actor.companyId,
      name,
      email,
      role,
      passwordHash: hashPassword(password),
    },
  });

  await writeAuditLog({
    action: AuditAction.USER_CREATED,
    companyId: actor.companyId,
    actorId: actor.id,
    ...(await getRequestContext()),
    metadata: {
      targetUserId: created.id,
      targetEmail: created.email,
      role,
    },
  });

  revalidatePath("/settings/users");
  redirect("/settings/users?notice=ユーザーを作成しました。");
}

export async function updateCompanyUserAction(
  targetUserId: string,
  formData: FormData,
) {
  const actor = await ensureCanManageUsers();
  const name = String(formData.get("name") ?? "").trim();
  const role = parseRole(formData.get("role"), actor.role);
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    redirect("/settings/users?error=名前を入力してください。");
  }

  if (targetUserId === actor.id && !isActive) {
    redirect("/settings/users?error=自分自身は停止できません。");
  }

  const target = await ensureOwnerContinuity({
    companyId: actor.companyId,
    targetUserId,
    nextRole: role,
    nextActive: isActive,
  });

  if (target.role === UserRole.OWNER && actor.role !== UserRole.OWNER) {
    redirect("/settings/users?error=OWNERはOWNERのみ変更できます。");
  }

  const updated = await prisma.companyUser.update({
    where: {
      id: targetUserId,
    },
    data: {
      name,
      role,
      isActive,
    },
  });

  if (!updated.isActive) {
    await prisma.session.deleteMany({
      where: {
        userId: updated.id,
      },
    });
  }

  await writeAuditLog({
    action: AuditAction.USER_UPDATED,
    companyId: actor.companyId,
    actorId: actor.id,
    ...(await getRequestContext()),
    metadata: {
      targetUserId: updated.id,
      targetEmail: updated.email,
      role: updated.role,
      isActive: updated.isActive,
    },
  });

  revalidatePath("/settings/users");
  redirect("/settings/users?notice=ユーザーを更新しました。");
}

export async function resetCompanyUserPasswordAction(
  targetUserId: string,
  formData: FormData,
) {
  const actor = await ensureCanManageUsers();
  const password = String(formData.get("password") ?? "");

  if (password.length < 12) {
    redirect(
      "/settings/users?error=新しいパスワードは12文字以上にしてください。",
    );
  }

  const target = await prisma.companyUser.findFirst({
    where: {
      id: targetUserId,
      companyId: actor.companyId,
    },
  });

  if (!target) {
    redirect("/settings/users?error=ユーザーが見つかりません。");
  }

  if (target.role === UserRole.OWNER && actor.role !== UserRole.OWNER) {
    redirect("/settings/users?error=OWNERのパスワードはOWNERのみ変更できます。");
  }

  await prisma.companyUser.update({
    where: {
      id: target.id,
    },
    data: {
      passwordHash: hashPassword(password),
    },
  });

  await prisma.session.deleteMany({
    where: {
      userId: target.id,
    },
  });

  await writeAuditLog({
    action: AuditAction.USER_UPDATED,
    companyId: actor.companyId,
    actorId: actor.id,
    ...(await getRequestContext()),
    metadata: {
      targetUserId: target.id,
      targetEmail: target.email,
      passwordReset: true,
      sessionsRevoked: true,
    },
  });

  revalidatePath("/settings/users");
  redirect("/settings/users?notice=パスワードを再設定しました。");
}

export async function revokeCompanyUserSessionsAction(targetUserId: string) {
  const actor = await ensureCanManageUsers();

  const target = await prisma.companyUser.findFirst({
    where: {
      id: targetUserId,
      companyId: actor.companyId,
    },
  });

  if (!target) {
    redirect("/settings/users?error=ユーザーが見つかりません。");
  }

  await prisma.session.deleteMany({
    where: {
      userId: target.id,
    },
  });

  await writeAuditLog({
    action: AuditAction.SESSION_REVOKED,
    companyId: actor.companyId,
    actorId: actor.id,
    ...(await getRequestContext()),
    metadata: {
      targetUserId: target.id,
      targetEmail: target.email,
    },
  });

  revalidatePath("/settings/users");
  redirect("/settings/users?notice=セッションを失効しました。");
}
