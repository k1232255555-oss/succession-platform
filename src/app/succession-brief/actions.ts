"use server";

import {
  AuditAction,
  BriefVisibilityScope,
  SuccessionStage,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit";
import {
  getRequestContext,
  requireSameOriginRequest,
  requireUser,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  businessSummaryMaxLength,
  contactMessageMaxLength,
  hasSensitiveInfo,
  industryOptions,
  issueCategoryOptions,
  nextActionOptions,
  onlyAllowedValues,
  prefectureOptions,
  stakeholderTypeOptions,
  valueCategoryOptions,
} from "@/lib/succession-brief";

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

function redirectWithError(message: string): never {
  redirect(`/succession-brief/new?error=${encodeURIComponent(message)}`);
}

function parseSuccessionStage(value: string) {
  if (
    Object.values(SuccessionStage).includes(value as SuccessionStage)
  ) {
    return value as SuccessionStage;
  }

  return null;
}

function parseVisibilityScope(value: string) {
  if (
    Object.values(BriefVisibilityScope).includes(value as BriefVisibilityScope)
  ) {
    return value as BriefVisibilityScope;
  }

  return null;
}

export async function submitSuccessionBriefAction(formData: FormData) {
  await requireSameOriginRequest();

  const user = await requireUser();
  const requestContext = await getRequestContext();

  const industry = getFormValue(formData, "industry");
  const prefecture = getFormValue(formData, "prefecture");
  const successionStage = parseSuccessionStage(
    getFormValue(formData, "successionStage"),
  );
  const visibilityScope = parseVisibilityScope(
    getFormValue(formData, "visibilityScope"),
  );
  const businessSummary = truncate(
    getFormValue(formData, "businessSummary"),
    businessSummaryMaxLength,
  );
  const contactName = truncate(getFormValue(formData, "contactName"), 80);
  const contactEmail = truncate(getFormValue(formData, "contactEmail"), 160);
  const contactMessage = truncate(
    getFormValue(formData, "contactMessage"),
    contactMessageMaxLength,
  );
  const contactConsent = getFormValue(formData, "contactConsent") === "on";
  const wantsConsultation =
    Boolean(contactEmail || contactName || contactMessage) ||
    getFormValue(formData, "wantsConsultation") === "on";

  const allowedIndustries = new Set<string>(
    industryOptions.map((option) => option.value),
  );
  const allowedPrefectures = new Set<string>(prefectureOptions);

  if (!allowedIndustries.has(industry)) {
    redirectWithError("業種を選択してください。");
  }

  if (prefecture && !allowedPrefectures.has(prefecture)) {
    redirectWithError("都道府県を確認してください。");
  }

  if (!successionStage || !visibilityScope) {
    redirectWithError("承継段階と公開範囲を選択してください。");
  }

  const parsedSuccessionStage = successionStage;
  const parsedVisibilityScope = visibilityScope;

  const valueCategories = onlyAllowedValues(
    getFormValues(formData, "valueCategories"),
    valueCategoryOptions,
  );
  const stakeholderTypes = onlyAllowedValues(
    getFormValues(formData, "stakeholderTypes"),
    stakeholderTypeOptions,
  );
  const issueCategories = onlyAllowedValues(
    getFormValues(formData, "issueCategories"),
    issueCategoryOptions,
  );
  const unresolvedItems = onlyAllowedValues(
    getFormValues(formData, "unresolvedItems"),
    issueCategoryOptions,
  );
  const nextActions = onlyAllowedValues(
    getFormValues(formData, "nextActions"),
    nextActionOptions,
  );

  if (!valueCategories.length || !issueCategories.length || !nextActions.length) {
    redirectWithError("残したい価値、論点、次のアクションを1つ以上選択してください。");
  }

  if (parsedVisibilityScope === BriefVisibilityScope.PRIVATE && wantsConsultation) {
    redirectWithError(
      "相談希望がある場合は、運営確認への同意が必要です。公開範囲を変更するか、相談内容確認に同意してください。",
    );
  }

  if (wantsConsultation) {
    if (!contactEmail || !contactEmail.includes("@")) {
      redirectWithError("相談希望の場合はメールアドレスを入力してください。");
    }

    if (
      parsedVisibilityScope !== BriefVisibilityScope.SHARE_WITH_OPERATOR &&
      !contactConsent
    ) {
      redirectWithError("相談希望の場合は、運営が内容を確認することに同意してください。");
    }
  }

  const sensitiveInfoFlag = [
    businessSummary,
    contactMessage,
    contactName,
  ].some((value) => value && hasSensitiveInfo(value));

  const brief = await prisma.successionBrief.create({
    data: {
      createdByUserId: user.id,
      industry,
      prefecture: prefecture || null,
      businessSummary: businessSummary || null,
      successionStage: parsedSuccessionStage,
      visibilityScope: parsedVisibilityScope,
      valueCategories,
      stakeholderTypes,
      issueCategories,
      unresolvedItems,
      nextActions,
      sensitiveInfoFlag,
      contactRequest: wantsConsultation
        ? {
            create: {
              email: contactEmail,
              name: contactName || null,
              message: contactMessage || null,
            },
          }
        : undefined,
    },
  });

  await writeAuditLog({
    action: AuditAction.SUCCESSION_BRIEF_SUBMITTED,
    companyId: user.companyId,
    actorId: user.id,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
    metadata: {
      briefId: brief.id,
      visibilityScope: parsedVisibilityScope,
      successionStage: parsedSuccessionStage,
      industry,
      wantsConsultation,
      sensitiveInfoFlag,
    },
  });

  redirect(
    `/succession-brief/new?notice=${encodeURIComponent(
      "承継ブリーフを受け付けました。入力内容は選択した範囲でのみ扱います。",
    )}`,
  );
}
