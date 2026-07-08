import {
  BusinessOpportunityVisibility,
  type BusinessOpportunity,
} from "@prisma/client";
import {
  businessOpportunityVisibilityDescriptions,
  businessOpportunityVisibilityLabels,
  opportunitySummaryMaxLength,
  opportunityTitleMaxLength,
  preferredSuccessorTypeOptions,
  strengthOptions,
  successionNeedOptions,
} from "@/lib/business-opportunities";
import {
  industryOptions,
  prefectureOptions,
  optionLabel,
} from "@/lib/succession-brief";

function CheckboxGroup({
  name,
  options,
  defaultValues = [],
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValues?: string[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-11 items-center gap-3 rounded border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-200"
        >
          <input
            name={name}
            type="checkbox"
            value={option.value}
            defaultChecked={defaultValues.includes(option.value)}
            className="h-4 w-4 accent-amber-300"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-zinc-100">
      {children}
      {required ? <span className="ml-1 text-amber-200">*</span> : null}
    </label>
  );
}

export function BusinessOpportunityForm({
  action,
  opportunity,
}: {
  action: (formData: FormData) => void | Promise<void>;
  opportunity?: BusinessOpportunity;
}) {
  return (
    <form action={action} className="space-y-6">
      <section className="rounded border border-amber-300/25 bg-amber-300/10 p-4">
        <h2 className="text-sm font-semibold text-amber-100">
          匿名情報として登録してください
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-50/80">
          匿名タイトルや概要には、会社名、屋号、代表者名、店舗名、住所、取引先名、売上、利益、借入など特定につながる情報を書かないでください。
        </p>
      </section>

      <section className="rounded border border-zinc-800 bg-black/35 p-5">
        <h2 className="text-lg font-semibold text-white">基本情報</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel required>匿名タイトル</FieldLabel>
            <input
              name="title"
              required
              maxLength={opportunityTitleMaxLength}
              defaultValue={opportunity?.title}
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
              placeholder="例: 地域の製造業 / 老舗飲食店 / 小規模建設業"
            />
            <p className="text-xs leading-5 text-zinc-500">
              {opportunityTitleMaxLength}
              文字以内。会社名、屋号、代表者名、店舗名は書かないでください。
            </p>
          </div>

          <div className="space-y-2">
            <FieldLabel required>業種</FieldLabel>
            <select
              name="industry"
              required
              defaultValue={opportunity?.industry ?? ""}
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
            >
              <option value="" disabled>
                選択してください
              </option>
              {industryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel>地域</FieldLabel>
            <select
              name="region"
              defaultValue={opportunity?.region ?? ""}
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
            >
              <option value="">未選択</option>
              {prefectureOptions.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel required>公開範囲</FieldLabel>
            <select
              name="visibility"
              required
              defaultValue={
                opportunity?.visibility ?? BusinessOpportunityVisibility.PRIVATE
              }
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
            >
              <option value={BusinessOpportunityVisibility.PRIVATE}>
                {businessOpportunityVisibilityLabels.PRIVATE}
              </option>
              <option value={BusinessOpportunityVisibility.LIMITED}>
                {businessOpportunityVisibilityLabels.LIMITED}
              </option>
            </select>
            <p className="text-xs leading-5 text-zinc-500">
              {businessOpportunityVisibilityDescriptions.PRIVATE}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <FieldLabel required>概要</FieldLabel>
          <textarea
            name="summary"
            required
            rows={5}
            maxLength={opportunitySummaryMaxLength}
            defaultValue={opportunity?.summary}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm leading-6 text-white"
            placeholder="例: 地域に長く根ざした小規模事業。技術や顧客との関係を未来へつなぐ方法を探している。"
          />
          <p className="text-xs leading-5 text-zinc-500">
            {opportunitySummaryMaxLength}
            文字以内。会社名、住所、取引先名、売上、借入、代表者名は書かないでください。
          </p>
        </div>
      </section>

      <section className="rounded border border-zinc-800 bg-black/35 p-5">
        <h2 className="text-lg font-semibold text-white">承継に向けた整理</h2>
        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <FieldLabel required>残したい価値</FieldLabel>
            <CheckboxGroup
              name="strengths"
              options={strengthOptions}
              defaultValues={opportunity?.strengths}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel required>承継で必要なこと</FieldLabel>
            <CheckboxGroup
              name="successionNeeds"
              options={successionNeedOptions}
              defaultValues={opportunity?.successionNeeds}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel required>望ましい引き継ぎ手</FieldLabel>
            <CheckboxGroup
              name="preferredSuccessorTypes"
              options={preferredSuccessorTypeOptions}
              defaultValues={opportunity?.preferredSuccessorTypes}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-500">
          この登録は引き継ぎ募集の準備用です。一般公開、課金、AI判定、対話申請には接続しません。
        </p>
        <button
          type="submit"
          className="rounded bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
        >
          承継プロジェクトを保存
        </button>
      </div>
    </form>
  );
}

export function BusinessOpportunityPreview({
  opportunity,
}: {
  opportunity: BusinessOpportunity;
}) {
  return (
    <div className="rounded border border-amber-300/15 bg-black/35 p-5">
      <p className="text-sm font-medium text-amber-200/80">
        引き継ぎ希望者に見せる場合の匿名プレビュー
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        {opportunity.title}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        {optionLabel(industryOptions, opportunity.industry)}
        {opportunity.region ? ` / ${opportunity.region}` : ""}
      </p>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
        {opportunity.summary}
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <PreviewList
          title="残したい価値"
          items={opportunity.strengths}
          options={strengthOptions}
        />
        <PreviewList
          title="承継で必要なこと"
          items={opportunity.successionNeeds}
          options={successionNeedOptions}
        />
        <PreviewList
          title="望ましい引き継ぎ手"
          items={opportunity.preferredSuccessorTypes}
          options={preferredSuccessorTypeOptions}
        />
      </div>
    </div>
  );
}

function PreviewList({
  title,
  items,
  options,
}: {
  title: string;
  items: string[];
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300"
          >
            {optionLabel(options, item)}
          </span>
        ))}
      </div>
    </div>
  );
}
