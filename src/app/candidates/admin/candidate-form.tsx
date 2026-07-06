import Link from "next/link";
import { CandidateReviewStatus, type SuccessorCandidate } from "@prisma/client";
import { Save, X } from "lucide-react";
import { reviewStatusLabels, reviewStatusOptions } from "@/lib/candidates";

type CandidateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  candidate?: SuccessorCandidate;
  error?: string;
  submitLabel: string;
};

function levelOptions() {
  return [1, 2, 3, 4, 5].map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ));
}

export function CandidateForm({
  action,
  candidate,
  error,
  submitLabel,
}: CandidateFormProps) {
  return (
    <form action={action} className="grid gap-4">
      {error ? (
        <div className="rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-xs font-medium text-zinc-500">名前</span>
          <input
            name="name"
            defaultValue={candidate?.name}
            required
            className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
          />
        </label>

        <label>
          <span className="text-xs font-medium text-zinc-500">年齢</span>
          <input
            name="age"
            type="number"
            min={18}
            max={80}
            defaultValue={candidate?.age}
            required
            className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
          />
        </label>

        <label>
          <span className="text-xs font-medium text-zinc-500">地域</span>
          <input
            name="region"
            defaultValue={candidate?.region}
            placeholder="例: 福岡"
            required
            className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
          />
        </label>

        <label>
          <span className="text-xs font-medium text-zinc-500">審査ステータス</span>
          <select
            name="reviewStatus"
            defaultValue={
              candidate?.reviewStatus ?? CandidateReviewStatus.UNDER_REVIEW
            }
            className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
          >
            {reviewStatusOptions.map((status) => (
              <option key={status} value={status}>
                {reviewStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-xs font-medium text-zinc-500">
            希望業種（カンマまたは改行区切り）
          </span>
          <textarea
            name="desiredIndustries"
            defaultValue={candidate?.desiredIndustries.join(", ")}
            rows={4}
            required
            className="mt-2 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none focus:border-amber-300/50"
          />
        </label>

        <label>
          <span className="text-xs font-medium text-zinc-500">
            スキル（カンマまたは改行区切り）
          </span>
          <textarea
            name="skills"
            defaultValue={candidate?.skills.join(", ")}
            rows={4}
            required
            className="mt-2 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none focus:border-amber-300/50"
          />
        </label>
      </div>

      <label>
        <span className="text-xs font-medium text-zinc-500">経歴</span>
        <textarea
          name="career"
          defaultValue={candidate?.career}
          rows={5}
          required
          className="mt-2 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none focus:border-amber-300/50"
        />
      </label>

      <label>
        <span className="text-xs font-medium text-zinc-500">自己PR</span>
        <textarea
          name="selfPr"
          defaultValue={candidate?.selfPr}
          rows={6}
          required
          className="mt-2 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none focus:border-amber-300/50"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label>
          <span className="text-xs font-medium text-zinc-500">AI活用度</span>
          <select
            name="aiUsageLevel"
            defaultValue={candidate?.aiUsageLevel ?? 3}
            className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
          >
            {levelOptions()}
          </select>
        </label>

        <label>
          <span className="text-xs font-medium text-zinc-500">現場経験</span>
          <select
            name="fieldExperienceLevel"
            defaultValue={candidate?.fieldExperienceLevel ?? 3}
            className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
          >
            {levelOptions()}
          </select>
        </label>

        <label>
          <span className="text-xs font-medium text-zinc-500">承継意欲</span>
          <select
            name="successionMotivationLevel"
            defaultValue={candidate?.successionMotivationLevel ?? 3}
            className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
          >
            {levelOptions()}
          </select>
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={candidate?.isFeatured ?? false}
          className="h-4 w-4 accent-amber-300"
        />
        注目候補として表示する
      </label>

      <div className="flex flex-col-reverse gap-2 border-t border-zinc-800 pt-4 sm:flex-row sm:justify-end">
        <Link
          href="/candidates/admin"
          className="inline-flex h-11 items-center justify-center gap-2 rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-300 transition hover:border-amber-300/30 hover:text-amber-100"
        >
          <X className="h-4 w-4" />
          キャンセル
        </Link>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
        >
          <Save className="h-4 w-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
