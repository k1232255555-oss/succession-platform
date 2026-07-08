import {
  BriefStatus,
  BriefVisibilityScope,
  SuccessionStage,
} from "@prisma/client";

export const businessSummaryMaxLength = 500;
export const contactMessageMaxLength = 500;
export const aggregateMinimumCount = 3;

export const industryOptions = [
  { value: "manufacturing", label: "製造" },
  { value: "construction", label: "建設・専門工事" },
  { value: "food_processing", label: "食品製造・加工" },
  { value: "hospitality", label: "宿泊・観光" },
  { value: "restaurant", label: "飲食" },
  { value: "retail", label: "小売" },
  { value: "logistics", label: "物流・運送" },
  { value: "healthcare", label: "医療・介護" },
  { value: "professional_service", label: "専門サービス" },
  { value: "other", label: "その他" },
] as const;

export const prefectureOptions = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

export const successionStageOptions = [
  { value: SuccessionStage.NOT_STARTED, label: "未着手" },
  { value: SuccessionStage.ORGANIZING_INFORMATION, label: "情報整理中" },
  {
    value: SuccessionStage.DISCUSSING_WITH_STAKEHOLDERS,
    label: "家族・関係者と相談中",
  },
  {
    value: SuccessionStage.SUCCESSOR_CANDIDATE_EXISTS,
    label: "後継者候補あり",
  },
  {
    value: SuccessionStage.CONSIDERING_EXTERNAL_SUCCESSION,
    label: "第三者承継を検討中",
  },
  { value: SuccessionStage.CONSIDERING_M_AND_A, label: "M&Aを検討中" },
  { value: SuccessionStage.CONSULTING_EXPERTS, label: "専門家相談中" },
  { value: SuccessionStage.PREPARING_TRANSITION, label: "移行準備中" },
  { value: SuccessionStage.UNKNOWN, label: "まだ分からない" },
] as const;

export const visibilityScopeOptions = [
  {
    value: BriefVisibilityScope.AGGREGATE_ONLY,
    label: "匿名集計のみ利用",
    description:
      "企業名や個人名を出さず、承継論点の匿名集計にのみ利用します。",
  },
  {
    value: BriefVisibilityScope.SHARE_WITH_OPERATOR,
    label: "運営確認用に共有",
    description:
      "相談希望や品質確認のため、運営が内容を確認します。外部公開はしません。",
  },
  {
    value: BriefVisibilityScope.PRIVATE,
    label: "本人保存用",
    description:
      "匿名集計にも運営確認にも使いません。ログインユーザーの保存用です。",
  },
] as const;

export const valueCategoryOptions = [
  { value: "skill", label: "技術・職人技" },
  { value: "employment", label: "雇用" },
  { value: "customer_base", label: "顧客基盤" },
  { value: "local_role", label: "地域での役割" },
  { value: "brand", label: "ブランド・のれん" },
  { value: "equipment", label: "設備" },
  { value: "supply_chain", label: "取引先・商流" },
  { value: "know_how", label: "ノウハウ" },
  { value: "other", label: "その他" },
] as const;

export const stakeholderTypeOptions = [
  { value: "owner", label: "オーナー" },
  { value: "family", label: "家族" },
  { value: "employee", label: "従業員" },
  { value: "successor_candidate", label: "後継者候補" },
  { value: "tax_accountant", label: "税理士・会計士" },
  { value: "financial_institution", label: "金融機関" },
  { value: "business_partner", label: "取引先" },
  { value: "municipality_support", label: "自治体・支援機関" },
  { value: "other", label: "その他" },
] as const;

export const issueCategoryOptions = [
  { value: "no_successor", label: "後継者不在" },
  { value: "family_alignment", label: "家族合意" },
  { value: "employee_succession", label: "従業員承継" },
  { value: "shares_equity", label: "株式・持分" },
  { value: "debt_guarantee", label: "借入・保証" },
  { value: "key_person_dependency", label: "業務属人化" },
  { value: "skill_transfer", label: "技術継承" },
  { value: "customer_continuity", label: "顧客・取引先継続" },
  { value: "financial_transparency", label: "財務透明性" },
  { value: "business_attractiveness", label: "事業の魅力整理" },
  { value: "candidate_search", label: "引き継ぎ希望者の探索" },
  { value: "expert_consultation", label: "専門家相談" },
] as const;

export const nextActionOptions = [
  { value: "talk_with_family", label: "家族と話す" },
  { value: "talk_with_employee_candidate", label: "従業員候補と話す" },
  { value: "consult_tax_accountant", label: "税理士へ相談する" },
  { value: "consult_financial_institution", label: "金融機関へ相談する" },
  { value: "organize_business_strengths", label: "事業の強みを整理する" },
  { value: "organize_for_successor", label: "引き継ぎ希望者に伝える情報を整理する" },
  { value: "consult_expert", label: "専門家に相談する" },
  { value: "not_sure", label: "まだ分からない" },
] as const;

export const briefStatusLabels: Record<BriefStatus, string> = {
  [BriefStatus.SUBMITTED]: "受付済み",
  [BriefStatus.REVIEWED]: "確認済み",
  [BriefStatus.ARCHIVED]: "アーカイブ",
};

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function optionLabels(
  options: readonly { value: string; label: string }[],
  values: string[],
) {
  return values.map((value) => optionLabel(options, value));
}

export function hasSensitiveInfo(value: string) {
  const patterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /(?:0\d{1,4}[-ー−\s]?\d{1,4}[-ー−\s]?\d{3,4})/,
    /\d{3}[-ー−]\d{4}/,
    /(?:都|道|府|県|市|区|町|村).{0,20}\d/,
    /(株式会社|有限会社|合同会社|代表取締役|電話|住所|メール|携帯)/,
  ];

  return patterns.some((pattern) => pattern.test(value));
}

export function onlyAllowedValues(
  values: string[],
  options: readonly { value: string; label: string }[],
) {
  const allowed = new Set(options.map((option) => option.value));
  return values.filter((value) => allowed.has(value));
}
