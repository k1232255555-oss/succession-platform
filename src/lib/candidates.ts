import { CandidateReviewStatus } from "@prisma/client";

export const reviewStatusLabels: Record<CandidateReviewStatus, string> = {
  DRAFT: "下書き",
  UNDER_REVIEW: "審査中",
  APPROVED: "承認済み",
  REJECTED: "差し戻し",
  ARCHIVED: "非公開",
};

export const reviewStatusOptions = [
  CandidateReviewStatus.DRAFT,
  CandidateReviewStatus.UNDER_REVIEW,
  CandidateReviewStatus.APPROVED,
  CandidateReviewStatus.REJECTED,
  CandidateReviewStatus.ARCHIVED,
] as const;

export function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function parseLevel(value: FormDataEntryValue | null) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return 3;
  }

  return Math.min(5, Math.max(1, parsed));
}

export function parseAge(value: FormDataEntryValue | null) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return null;
  }

  if (parsed < 18 || parsed > 80) {
    return null;
  }

  return parsed;
}

export function getCandidateScore(input: {
  aiUsageLevel: number;
  fieldExperienceLevel: number;
  successionMotivationLevel: number;
}) {
  return Math.round(
    ((input.aiUsageLevel +
      input.fieldExperienceLevel +
      input.successionMotivationLevel) /
      15) *
      100,
  );
}
