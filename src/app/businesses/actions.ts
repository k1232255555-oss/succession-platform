"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AuditAction,
  BusinessOpportunityStatus,
  BusinessOpportunityVisibility,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import {
  canManageBusinessOpportunities,
  getRequestContext,
  requireRole,
  requireSameOriginRequest,
  requireUser,
} from "@/lib/auth";
import {
  hasBusinessOpportunitySensitiveInfo,
  isAllowedIndustry,
  isAllowedRegion,
  onlyAllowedValues,
  opportunitySummaryMaxLength,
  opportunityTitleMaxLength,
  parseBusinessOpportunityStatus,
  parseBusinessOpportunityVisibility,
  preferredSuccessorTypeOptions,
  strengthOptions,
  successionNeedOptions,
} from "@/lib/business-opportunities";
import { prisma } from "@/lib/prisma";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function truncate(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function getBusinessOpportunityInput(formData: FormData) {
  const title = truncate(getFormValue(formData, "title"), opportunityTitleMaxLength);
  const industry = getFormValue(formData, "industry");
  const region = getFormValue(formData, "region");
  const summary = truncate(
    getFormValue(formData, "summary"),
    opportunitySummaryMaxLength,
  );
  const strengths = onlyAllowedValues(
    getFormValues(formData, "strengths"),
    strengthOptions,
  );
  const successionNeeds = onlyAllowedValues(
    getFormValues(formData, "successionNeeds"),
    successionNeedOptions,
  );
  const preferredSuccessorTypes = onlyAllowedValues(
    getFormValues(formData, "preferredSuccessorTypes"),
    preferredSuccessorTypeOptions,
  );
  const visibility = parseBusinessOpportunityVisibility(
    getFormValue(formData, "visibility"),
  );

  if (!title || !industry || !summary) {
    return {
      error: "匿名タイトル、業種、概要を入力してください。",
    } as const;
  }

  if (!isAllowedIndustry(industry)) {
    return {
      error: "業種を確認してください。",
    } as const;
  }

  if (!isAllowedRegion(region)) {
    return {
      error: "地域を確認してください。",
    } as const;
  }

  if (
    !strengths.length ||
    !successionNeeds.length ||
    !preferredSuccessorTypes.length
  ) {
    return {
      error:
        "残したい価値、承継で必要なこと、望ましい引き継ぎ手を1つ以上選択してください。",
    } as const;
  }

  const safeVisibility =
    visibility === BusinessOpportunityVisibility.PUBLIC
      ? BusinessOpportunityVisibility.PRIVATE
      : visibility;

  return {
    data: {
      title,
      industry,
      region: region || null,
      summary,
      strengths,
      successionNeeds,
      preferredSuccessorTypes,
      visibility: safeVisibility,
      isAnonymous: true,
      sensitiveInfoFlag: hasBusinessOpportunitySensitiveInfo({
        title,
        summary,
      }),
    },
  } as const;
}

async function writeBusinessOpportunityAudit(input: {
  action: AuditAction;
  companyId: string;
  actorId: string;
  opportunityId: string;
  title: string;
  status: BusinessOpportunityStatus;
  visibility: BusinessOpportunityVisibility;
  sensitiveInfoFlag: boolean;
}) {
  await writeAuditLog({
    action: input.action,
    companyId: input.companyId,
    actorId: input.actorId,
    ...(await getRequestContext()),
    metadata: {
      businessOpportunityId: input.opportunityId,
      title: input.title,
      status: input.status,
      visibility: input.visibility,
      sensitiveInfoFlag: input.sensitiveInfoFlag,
    },
  });
}

export async function createBusinessOpportunityAction(formData: FormData) {
  await requireSameOriginRequest();

  const user = await requireUser();

  if (!canManageBusinessOpportunities(user)) {
    redirect("/dashboard");
  }

  const input = getBusinessOpportunityInput(formData);

  if (input.error) {
    redirectWithError("/businesses/new", input.error);
  }

  const opportunity = await prisma.businessOpportunity.create({
    data: {
      ...input.data,
      companyId: user.companyId,
      createdById: user.id,
    },
  });

  await writeBusinessOpportunityAudit({
    action: AuditAction.BUSINESS_OPPORTUNITY_CREATED,
    companyId: user.companyId,
    actorId: user.id,
    opportunityId: opportunity.id,
    title: opportunity.title,
    status: opportunity.status,
    visibility: opportunity.visibility,
    sensitiveInfoFlag: opportunity.sensitiveInfoFlag,
  });

  revalidatePath("/businesses");
  redirect(`/businesses/${opportunity.id}`);
}

export async function updateBusinessOpportunityAction(
  opportunityId: string,
  formData: FormData,
) {
  await requireSameOriginRequest();

  const user = await requireUser();

  if (!canManageBusinessOpportunities(user)) {
    redirect("/dashboard");
  }

  const input = getBusinessOpportunityInput(formData);

  if (input.error) {
    redirectWithError(`/businesses/${opportunityId}/edit`, input.error);
  }

  const existing = await prisma.businessOpportunity.findFirst({
    where: {
      id: opportunityId,
      companyId: user.companyId,
      status: {
        not: BusinessOpportunityStatus.ARCHIVED,
      },
    },
  });

  if (!existing) {
    redirect("/businesses");
  }

  const opportunity = await prisma.businessOpportunity.update({
    where: {
      id: opportunityId,
    },
    data: input.data,
  });

  await writeBusinessOpportunityAudit({
    action: AuditAction.BUSINESS_OPPORTUNITY_UPDATED,
    companyId: user.companyId,
    actorId: user.id,
    opportunityId: opportunity.id,
    title: opportunity.title,
    status: opportunity.status,
    visibility: opportunity.visibility,
    sensitiveInfoFlag: opportunity.sensitiveInfoFlag,
  });

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${opportunity.id}`);
  revalidatePath("/settings/businesses");
  redirect(`/businesses/${opportunity.id}`);
}

export async function submitBusinessOpportunityForReviewAction(
  opportunityId: string,
) {
  await requireSameOriginRequest();

  const user = await requireUser();

  if (!canManageBusinessOpportunities(user)) {
    redirect("/dashboard");
  }

  const opportunity = await prisma.businessOpportunity.update({
    where: {
      id: opportunityId,
      companyId: user.companyId,
    },
    data: {
      status: BusinessOpportunityStatus.IN_REVIEW,
    },
  });

  await writeBusinessOpportunityAudit({
    action: AuditAction.BUSINESS_OPPORTUNITY_SUBMITTED_FOR_REVIEW,
    companyId: user.companyId,
    actorId: user.id,
    opportunityId: opportunity.id,
    title: opportunity.title,
    status: opportunity.status,
    visibility: opportunity.visibility,
    sensitiveInfoFlag: opportunity.sensitiveInfoFlag,
  });

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${opportunity.id}`);
  revalidatePath("/settings/businesses");
  redirect(`/businesses/${opportunity.id}`);
}

export async function updateBusinessOpportunityReviewAction(
  opportunityId: string,
  formData: FormData,
) {
  await requireSameOriginRequest();

  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const status = parseBusinessOpportunityStatus(getFormValue(formData, "status"));
  const visibility = parseBusinessOpportunityVisibility(
    getFormValue(formData, "visibility"),
  );
  const safeVisibility =
    visibility === BusinessOpportunityVisibility.PUBLIC
      ? BusinessOpportunityVisibility.LIMITED
      : visibility;

  const opportunity = await prisma.businessOpportunity.update({
    where: {
      id: opportunityId,
    },
    data: {
      status,
      visibility: safeVisibility,
    },
  });

  const action =
    status === BusinessOpportunityStatus.PUBLISHED
      ? AuditAction.BUSINESS_OPPORTUNITY_PUBLISHED
      : status === BusinessOpportunityStatus.ARCHIVED
        ? AuditAction.BUSINESS_OPPORTUNITY_ARCHIVED
        : AuditAction.BUSINESS_OPPORTUNITY_UPDATED;

  await writeBusinessOpportunityAudit({
    action,
    companyId: opportunity.companyId,
    actorId: user.id,
    opportunityId: opportunity.id,
    title: opportunity.title,
    status: opportunity.status,
    visibility: opportunity.visibility,
    sensitiveInfoFlag: opportunity.sensitiveInfoFlag,
  });

  revalidatePath("/settings/businesses");
  revalidatePath("/businesses");
  redirect("/settings/businesses");
}
