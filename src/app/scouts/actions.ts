"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuditAction } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import {
  canScoutCandidates,
  getRequestContext,
  requireUser,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseMeetingDate, parseScoutStatus } from "@/lib/scouts";

async function requireScoutPermission() {
  const user = await requireUser();

  if (!canScoutCandidates(user)) {
    redirect("/candidates?error=スカウト権限がありません。");
  }

  return user;
}

export async function createScoutRequestAction(
  candidateId: string,
  formData: FormData,
) {
  const user = await requireScoutPermission();
  const message = String(formData.get("message") ?? "").trim();
  const feeAcknowledged = formData.get("feeAcknowledged") === "on";
  const proposedMeetingAt = parseMeetingDate(formData.get("proposedMeetingAt"));

  if (!message || message.length < 20) {
    redirect(
      `/candidates/${candidateId}?error=${encodeURIComponent(
        "スカウト文は20文字以上で入力してください。",
      )}`,
    );
  }

  if (!feeAcknowledged) {
    redirect(
      `/candidates/${candidateId}?error=${encodeURIComponent(
        "マッチング料発生の確認にチェックしてください。",
      )}`,
    );
  }

  const candidate = await prisma.successorCandidate.findFirst({
    where: {
      id: candidateId,
      companyId: user.companyId,
    },
  });

  if (!candidate) {
    redirect("/candidates?error=候補者が見つかりません。");
  }

  const scout = await prisma.scoutRequest.create({
    data: {
      companyId: user.companyId,
      candidateId: candidate.id,
      createdById: user.id,
      message,
      feeAcknowledged,
      proposedMeetingAt,
    },
  });

  await writeAuditLog({
    action: AuditAction.SCOUT_CREATED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      scoutRequestId: scout.id,
      candidateId: candidate.id,
      candidateName: candidate.name,
      feeAcknowledged,
    },
  });

  revalidatePath("/scouts");
  revalidatePath(`/candidates/${candidate.id}`);
  redirect(`/scouts?notice=${encodeURIComponent("スカウトを送信しました。")}`);
}

export async function updateScoutRequestAction(
  scoutRequestId: string,
  formData: FormData,
) {
  const user = await requireScoutPermission();
  const status = parseScoutStatus(formData.get("status"));
  const proposedMeetingAt = parseMeetingDate(formData.get("proposedMeetingAt"));

  const scout = await prisma.scoutRequest.findFirst({
    where: {
      id: scoutRequestId,
      companyId: user.companyId,
    },
    include: {
      candidate: true,
    },
  });

  if (!scout) {
    redirect("/scouts?error=スカウト依頼が見つかりません。");
  }

  const updated = await prisma.scoutRequest.update({
    where: {
      id: scout.id,
    },
    data: {
      status,
      proposedMeetingAt,
    },
  });

  await writeAuditLog({
    action: AuditAction.SCOUT_UPDATED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      scoutRequestId: updated.id,
      candidateId: scout.candidateId,
      candidateName: scout.candidate.name,
      status,
    },
  });

  revalidatePath("/scouts");
  revalidatePath(`/candidates/${scout.candidateId}`);
  redirect(`/scouts?notice=${encodeURIComponent("スカウト状況を更新しました。")}`);
}
