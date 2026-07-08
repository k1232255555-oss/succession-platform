import {
  BusinessOpportunityStatus,
  BusinessOpportunityVisibility,
} from "@prisma/client";
import {
  hasSensitiveInfo,
  industryOptions,
  prefectureOptions,
} from "@/lib/succession-brief";

export const opportunityTitleMaxLength = 80;
export const opportunitySummaryMaxLength = 500;

export const businessOpportunityVisibilityLabels: Record<
  BusinessOpportunityVisibility,
  string
> = {
  [BusinessOpportunityVisibility.PRIVATE]: "非公開",
  [BusinessOpportunityVisibility.LIMITED]: "限定公開準備",
  [BusinessOpportunityVisibility.PUBLIC]: "一般公開準備",
};

export const businessOpportunityStatusLabels: Record<
  BusinessOpportunityStatus,
  string
> = {
  [BusinessOpportunityStatus.DRAFT]: "下書き",
  [BusinessOpportunityStatus.IN_REVIEW]: "運営確認中",
  [BusinessOpportunityStatus.PUBLISHED]: "公開準備完了",
  [BusinessOpportunityStatus.ARCHIVED]: "アーカイブ",
};

export const businessOpportunityVisibilityDescriptions: Record<
  BusinessOpportunityVisibility,
  string
> = {
  [BusinessOpportunityVisibility.PRIVATE]:
    "自社と運営OWNERのみが確認します。初期登録はこの状態です。",
  [BusinessOpportunityVisibility.LIMITED]:
    "将来の限定公開に向けた状態です。今回のMVPでは外部表示には接続しません。",
  [BusinessOpportunityVisibility.PUBLIC]:
    "将来用です。今回のMVPでは画面から選択できません。",
};

export const strengthOptions = [
  { value: "craft", label: "技術・職人技" },
  { value: "local_customers", label: "地域の顧客基盤" },
  { value: "brand", label: "ブランド・のれん" },
  { value: "equipment", label: "設備・拠点" },
  { value: "team", label: "従業員・チーム" },
  { value: "know_how", label: "ノウハウ" },
  { value: "community_role", label: "地域での役割" },
  { value: "other", label: "その他" },
] as const;

export const successionNeedOptions = [
  { value: "successor", label: "引き継ぎ手を探したい" },
  { value: "management", label: "経営を任せられる人を探したい" },
  { value: "skills", label: "技術や現場を引き継ぎたい" },
  { value: "employees", label: "雇用を守りたい" },
  { value: "customers", label: "顧客や取引を継続したい" },
  { value: "local_presence", label: "地域での役割を残したい" },
  { value: "not_sure", label: "まだ整理中" },
] as const;

export const preferredSuccessorTypeOptions = [
  { value: "individual", label: "個人" },
  { value: "employee", label: "会社員・現場経験者" },
  { value: "entrepreneur", label: "起業希望者" },
  { value: "same_industry", label: "同業・近い業種の経験者" },
  { value: "company", label: "法人・同業企業" },
  { value: "relocation", label: "移住希望者" },
  { value: "former_manager", label: "元経営者・管理職経験者" },
  { value: "not_fixed", label: "まだ決めていない" },
] as const;

export function parseBusinessOpportunityVisibility(value: string) {
  if (
    Object.values(BusinessOpportunityVisibility).includes(
      value as BusinessOpportunityVisibility,
    )
  ) {
    return value as BusinessOpportunityVisibility;
  }

  return BusinessOpportunityVisibility.PRIVATE;
}

export function parseBusinessOpportunityStatus(value: string) {
  if (
    Object.values(BusinessOpportunityStatus).includes(
      value as BusinessOpportunityStatus,
    )
  ) {
    return value as BusinessOpportunityStatus;
  }

  return BusinessOpportunityStatus.DRAFT;
}

export function onlyAllowedValues(
  values: string[],
  options: readonly { value: string; label: string }[],
) {
  const allowed = new Set(options.map((option) => option.value));
  return values.filter((value) => allowed.has(value));
}

export function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getOptionLabels(
  options: readonly { value: string; label: string }[],
  values: string[],
) {
  return values.map((value) => getOptionLabel(options, value));
}

export function isAllowedIndustry(value: string) {
  return industryOptions.some((option) => option.value === value);
}

export function isAllowedRegion(value: string) {
  return !value || prefectureOptions.includes(value as never);
}

export function hasBusinessOpportunitySensitiveInfo(input: {
  title: string;
  summary: string;
}) {
  return [input.title, input.summary].some((value) => hasSensitiveInfo(value));
}
