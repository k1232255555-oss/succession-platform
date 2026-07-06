"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuditAction, CandidateReviewStatus } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import {
  getRequestContext,
  requireRole,
  requireSameOriginRequest,
  requireUser,
} from "@/lib/auth";
import { parseAge, parseLevel, splitList } from "@/lib/candidates";
import { prisma } from "@/lib/prisma";

type CandidateInput = {
  name: string;
  age: number;
  region: string;
  desiredIndustries: string[];
  skills: string[];
  career: string;
  selfPr: string;
  aiUsageLevel: number;
  fieldExperienceLevel: number;
  successionMotivationLevel: number;
  reviewStatus: CandidateReviewStatus;
  isFeatured: boolean;
};

function getStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "");

  if (
    Object.values(CandidateReviewStatus).includes(
      status as CandidateReviewStatus,
    )
  ) {
    return status as CandidateReviewStatus;
  }

  return CandidateReviewStatus.UNDER_REVIEW;
}

function getCandidateInput(
  formData: FormData,
): { data: CandidateInput; error?: never } | { data?: never; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const age = parseAge(formData.get("age"));
  const region = String(formData.get("region") ?? "").trim();
  const desiredIndustries = splitList(formData.get("desiredIndustries"));
  const skills = splitList(formData.get("skills"));
  const career = String(formData.get("career") ?? "").trim();
  const selfPr = String(formData.get("selfPr") ?? "").trim();

  if (
    !name ||
    !age ||
    !region ||
    desiredIndustries.length === 0 ||
    skills.length === 0 ||
    !career ||
    !selfPr
  ) {
    return {
      error:
        "名前、年齢、地域、希望業種、スキル、経歴、自己PRを入力してください。",
    };
  }

  return {
    data: {
      name,
      age,
      region,
      desiredIndustries,
      skills,
      career,
      selfPr,
      aiUsageLevel: parseLevel(formData.get("aiUsageLevel")),
      fieldExperienceLevel: parseLevel(formData.get("fieldExperienceLevel")),
      successionMotivationLevel: parseLevel(
        formData.get("successionMotivationLevel"),
      ),
      reviewStatus: getStatus(formData.get("reviewStatus")),
      isFeatured: formData.get("isFeatured") === "on",
    },
  };
}

export async function createCandidateAction(formData: FormData) {
  await requireSameOriginRequest();

  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const input = getCandidateInput(formData);

  if (input.error) {
    redirect(`/candidates/admin/new?error=${encodeURIComponent(input.error)}`);
  }

  if (!input.data) {
    throw new Error("Invalid candidate input.");
  }

  const data = input.data;
  const candidate = await prisma.successorCandidate.create({
    data: {
      ...data,
      companyId: user.companyId,
    },
  });

  await writeAuditLog({
    action: AuditAction.CANDIDATE_CREATED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
    },
  });

  revalidatePath("/candidates");
  revalidatePath("/candidates/admin");
  redirect(`/candidates/${candidate.id}`);
}

export async function updateCandidateAction(
  candidateId: string,
  formData: FormData,
) {
  await requireSameOriginRequest();

  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const input = getCandidateInput(formData);

  if (input.error) {
    redirect(
      `/candidates/admin/${candidateId}/edit?error=${encodeURIComponent(
        input.error,
      )}`,
    );
  }

  if (!input.data) {
    throw new Error("Invalid candidate input.");
  }

  const data = input.data;
  const candidate = await prisma.successorCandidate.update({
    where: {
      id: candidateId,
      companyId: user.companyId,
    },
    data,
  });

  await writeAuditLog({
    action: AuditAction.CANDIDATE_UPDATED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
    },
  });

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${candidate.id}`);
  revalidatePath("/candidates/admin");
  redirect(`/candidates/${candidate.id}`);
}

export async function deleteCandidateAction(candidateId: string) {
  await requireSameOriginRequest();

  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const candidate = await prisma.successorCandidate.delete({
    where: {
      id: candidateId,
      companyId: user.companyId,
    },
  });

  await writeAuditLog({
    action: AuditAction.CANDIDATE_DELETED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
    },
  });

  revalidatePath("/candidates");
  revalidatePath("/candidates/admin");
  redirect("/candidates/admin");
}
