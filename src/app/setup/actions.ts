"use server";

import { redirect } from "next/navigation";
import { AuditAction, UserRole } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { createSession, getRequestContext } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type SetupState = {
  error?: string;
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function setupOwnerAction(
  _previousState: SetupState,
  formData: FormData,
): Promise<SetupState> {
  if (process.env.ALLOW_BOOTSTRAP_ADMIN !== "true") {
    return {
      error: "初期セットアップは現在無効です。",
    };
  }

  const existingUsers = await prisma.companyUser.count();

  if (existingUsers > 0) {
    return {
      error: "すでに管理者が存在します。セットアップは利用できません。",
    };
  }

  const companyName = String(formData.get("companyName") ?? "").trim();
  const companySlug = toSlug(String(formData.get("companySlug") ?? companyName));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!companyName || !companySlug || !name || !email || password.length < 12) {
    return {
      error: "すべての項目を入力し、パスワードは12文字以上にしてください。",
    };
  }

  const requestContext = await getRequestContext();

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        slug: companySlug,
      },
    });

    const user = await tx.companyUser.create({
      data: {
        companyId: company.id,
        email,
        name,
        role: UserRole.OWNER,
        passwordHash: hashPassword(password),
      },
    });

    return { company, user };
  });

  await writeAuditLog({
    action: AuditAction.USER_CREATED,
    companyId: result.company.id,
    actorId: result.user.id,
    ...requestContext,
    metadata: {
      bootstrap: true,
      role: UserRole.OWNER,
    },
  });

  await createSession(result.user.id);
  redirect("/");
}
