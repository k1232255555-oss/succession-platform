import { cookies, headers } from "next/headers";
import { cache } from "react";
import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import type { CompanyUser, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const sessionCookieName = "legacy_gate_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 14;

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(sessionCookieName);
}

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    return null;
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      lastSeenAt: new Date(),
    },
  });

  return session.user;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function canManageUsers(user: Pick<CompanyUser, "role">) {
  return user.role === "OWNER" || user.role === "ADMIN";
}

export function canManageBilling(user: Pick<CompanyUser, "role">) {
  return user.role === "OWNER" || user.role === "ADMIN";
}

export function canManageCandidates(user: Pick<CompanyUser, "role">) {
  return user.role === "OWNER";
}

export function requireRole(user: Pick<CompanyUser, "role">, roles: UserRole[]) {
  if (!roles.includes(user.role)) {
    redirect("/");
  }
}

export async function getRequestContext() {
  const headerStore = await headers();

  return {
    ipAddress:
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      undefined,
    userAgent: headerStore.get("user-agent") ?? undefined,
  };
}
