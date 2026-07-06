import { prisma } from "@/lib/prisma";

const failedLoginWindowMs = 1000 * 60 * 15;
const maxFailedAttempts = 5;

export async function isLoginRateLimited(input: {
  email: string;
  ipAddress?: string;
}) {
  const since = new Date(Date.now() - failedLoginWindowMs);

  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      success: false,
      createdAt: {
        gte: since,
      },
      OR: [
        {
          email: input.email,
        },
        ...(input.ipAddress
          ? [
              {
                ipAddress: input.ipAddress,
              },
            ]
          : []),
      ],
    },
  });

  return failedAttempts >= maxFailedAttempts;
}

export async function recordLoginAttempt(input: {
  email: string;
  ipAddress?: string;
  success: boolean;
}) {
  await prisma.loginAttempt.create({
    data: {
      email: input.email,
      ipAddress: input.ipAddress,
      success: input.success,
    },
  });
}
