"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuditAction } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import {
  getRequestContext,
  requireRole,
  requireSameOriginRequest,
  requireUser,
} from "@/lib/auth";
import { recalculateAiMatch } from "@/lib/ai-matching";
import { prisma } from "@/lib/prisma";

export async function recalculateCandidateAiMatchAction(candidateId: string) {
  await requireSameOriginRequest();

  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const [company, candidate] = await Promise.all([
    prisma.company.findUnique({
      where: {
        id: user.companyId,
      },
    }),
    prisma.successorCandidate.findFirst({
      where: {
        id: candidateId,
        companyId: user.companyId,
      },
    }),
  ]);

  if (!company || !candidate) {
    redirect("/candidates?error=AI再計算対象が見つかりません。");
  }

  const result = await recalculateAiMatch({
    company,
    candidate,
  });

  await writeAuditLog({
    action: AuditAction.AI_MATCH_RECALCULATED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
      score: result.score,
      isFallback: result.isFallback,
    },
  });

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${candidate.id}`);
  revalidatePath("/candidates/admin");
  redirect(`/candidates/${candidate.id}?notice=参考分析を再計算しました。`);
}

export async function recalculateAllCandidateAiMatchesAction() {
  await requireSameOriginRequest();

  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const company = await prisma.company.findUnique({
    where: {
      id: user.companyId,
    },
  });

  if (!company) {
    redirect("/candidates/admin?error=会社情報が見つかりません。");
  }

  const candidates = await prisma.successorCandidate.findMany({
    where: {
      companyId: user.companyId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50,
  });

  let fallbackCount = 0;

  for (const candidate of candidates) {
    const result = await recalculateAiMatch({
      company,
      candidate,
    });

    if (result.isFallback) {
      fallbackCount += 1;
    }
  }

  await writeAuditLog({
    action: AuditAction.AI_MATCH_RECALCULATED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      scope: "all_candidates",
      count: candidates.length,
      fallbackCount,
    },
  });

  revalidatePath("/candidates");
  revalidatePath("/candidates/admin");
  redirect(
    `/candidates/admin?notice=${encodeURIComponent(
      `参考分析を${candidates.length}件再計算しました。`,
    )}`,
  );
}
