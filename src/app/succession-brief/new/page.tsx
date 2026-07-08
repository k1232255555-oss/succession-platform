import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { submitSuccessionBriefAction } from "@/app/succession-brief/actions";
import { requireUser } from "@/lib/auth";
import {
  businessSummaryMaxLength,
  contactMessageMaxLength,
  industryOptions,
  issueCategoryOptions,
  nextActionOptions,
  prefectureOptions,
  stakeholderTypeOptions,
  successionStageOptions,
  valueCategoryOptions,
  visibilityScopeOptions,
} from "@/lib/succession-brief";

export const dynamic = "force-dynamic";

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

function CheckboxGroup({
  name,
  options,
  required = false,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
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
            required={required}
            className="h-4 w-4 accent-amber-300"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

export default async function NewSuccessionBriefPage({
  searchParams,
}: {
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードへ戻る
        </Link>

        <header className="mt-6 border-b border-zinc-800 pb-6">
          <p className="text-sm font-medium text-amber-200/80">
            Succession Issue Graph
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            承継ブリーフ
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            事業承継の現場で、何が話を前に進め、何が止めているのかを匿名・構造化して整理します。
            企業名や個人名ではなく、承継論点の蓄積を目的とした入力です。
          </p>
        </header>

        {params?.notice ? (
          <div className="mt-6 rounded border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {params.notice}
          </div>
        ) : null}

        {params?.error ? (
          <div className="mt-6 rounded border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {params.error}
          </div>
        ) : null}

        <section className="mt-6 rounded border border-amber-300/25 bg-amber-300/10 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <h2 className="text-sm font-semibold text-amber-100">
                個人情報を入力しないでください
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-50/80">
                事業概要には、企業名、個人名、電話番号、住所、メールアドレスなど特定につながる情報を書かないでください。
                自由記述は補足用であり、分析の主データは選択式カテゴリです。
              </p>
            </div>
          </div>
        </section>

        <form action={submitSuccessionBriefAction} className="mt-6 space-y-6">
          <section className="rounded border border-zinc-800 bg-black/35 p-5">
            <h2 className="text-lg font-semibold text-white">基本情報</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel required>業種</FieldLabel>
                <select
                  name="industry"
                  required
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
                  defaultValue=""
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
                <FieldLabel>都道府県</FieldLabel>
                <select
                  name="prefecture"
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
                  defaultValue=""
                >
                  <option value="">未選択</option>
                  {prefectureOptions.map((prefecture) => (
                    <option key={prefecture} value={prefecture}>
                      {prefecture}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <FieldLabel>事業概要</FieldLabel>
              <textarea
                name="businessSummary"
                maxLength={businessSummaryMaxLength}
                rows={4}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm leading-6 text-white"
                placeholder="例: 地域向けに食品加工を行っている小規模事業。企業名・個人名・連絡先は書かないでください。"
              />
              <p className="text-xs text-zinc-500">
                {businessSummaryMaxLength}
                文字以内。特定につながる情報は書かないでください。
              </p>
            </div>
          </section>

          <section className="rounded border border-zinc-800 bg-black/35 p-5">
            <h2 className="text-lg font-semibold text-white">論点整理</h2>
            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <FieldLabel required>承継段階</FieldLabel>
                <select
                  name="successionStage"
                  required
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
                  defaultValue=""
                >
                  <option value="" disabled>
                    選択してください
                  </option>
                  {successionStageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <FieldLabel required>残したい価値</FieldLabel>
                <CheckboxGroup name="valueCategories" options={valueCategoryOptions} />
              </div>

              <div className="space-y-2">
                <FieldLabel>関係者タイプ</FieldLabel>
                <CheckboxGroup name="stakeholderTypes" options={stakeholderTypeOptions} />
              </div>

              <div className="space-y-2">
                <FieldLabel required>現在の論点</FieldLabel>
                <CheckboxGroup name="issueCategories" options={issueCategoryOptions} />
              </div>

              <div className="space-y-2">
                <FieldLabel>未整理項目</FieldLabel>
                <CheckboxGroup name="unresolvedItems" options={issueCategoryOptions} />
              </div>

              <div className="space-y-2">
                <FieldLabel required>次のアクション</FieldLabel>
                <CheckboxGroup name="nextActions" options={nextActionOptions} />
              </div>
            </div>
          </section>

          <section className="rounded border border-zinc-800 bg-black/35 p-5">
            <h2 className="text-lg font-semibold text-white">扱い方</h2>
            <div className="mt-5 grid gap-3">
              {visibilityScopeOptions.map((option) => (
                <label
                  key={option.value}
                  className="rounded border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      name="visibilityScope"
                      type="radio"
                      value={option.value}
                      defaultChecked={option.value === "AGGREGATE_ONLY"}
                      className="mt-1 h-4 w-4 accent-amber-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {option.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              「本人保存用」は匿名集計にも運営確認にも使いません。
              Succession Issue Graphの主データは「匿名集計のみ利用」です。
            </p>
          </section>

          <section className="rounded border border-zinc-800 bg-black/35 p-5">
            <h2 className="text-lg font-semibold text-white">相談希望</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              相談を希望する場合のみ入力してください。連絡先は承継論点データとは分けて保存し、匿名集計には使いません。
            </p>
            <input type="hidden" name="wantsConsultation" value="off" />
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>お名前</FieldLabel>
                <input
                  name="contactName"
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
                  placeholder="任意"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>メールアドレス</FieldLabel>
                <input
                  name="contactEmail"
                  type="email"
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
                  placeholder="相談希望時のみ"
                />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <FieldLabel>相談メモ</FieldLabel>
              <textarea
                name="contactMessage"
                maxLength={contactMessageMaxLength}
                rows={3}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm leading-6 text-white"
                placeholder="相談したいことがあれば短く入力してください。企業名・電話番号・住所は書かないでください。"
              />
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-zinc-300">
              <input
                name="contactConsent"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-amber-300"
              />
              相談希望として送る場合、運営が入力内容と相談メモを確認することに同意します。
            </label>
          </section>

          <div className="flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-zinc-500">
              自動的な評価や診断は行いません。入力内容は論点整理のための参考情報です。
            </p>
            <button
              type="submit"
              className="rounded bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              承継ブリーフを保存
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
