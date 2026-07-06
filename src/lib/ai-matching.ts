import OpenAI from "openai";
import type {
  AiMatchResult,
  Company,
  SuccessorCandidate,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const aiMatchModel = process.env.OPENAI_MATCHING_MODEL ?? "gpt-5.5-mini";
export const aiMatchPromptVersion = "2026-07-06";

type MatchOutput = {
  score: number;
  reasons: string[];
  strengths: string[];
  concerns: string[];
  recommendation: string;
  expectedContribution: string[];
  cautionPoints: string[];
};

export type CandidateWithMatch = SuccessorCandidate & {
  aiMatchResults: AiMatchResult[];
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 5);

  return items.length > 0 ? items : fallback;
}

function normalizeMatchOutput(value: unknown): MatchOutput {
  const record = typeof value === "object" && value ? value as Record<string, unknown> : {};

  return {
    score: clampScore(Number(record.score)),
    reasons: normalizeList(record.reasons, ["プロフィール情報から一定の適合が見込めます。"]),
    strengths: normalizeList(record.strengths, ["承継意欲と行動力が評価できます。"]),
    concerns: normalizeList(record.concerns, ["面談で事業理解の深さを確認してください。"]),
    recommendation:
      String(record.recommendation ?? "").trim() ||
      "初回面談で事業課題と候補者の実行力を確認してください。",
    expectedContribution: normalizeList(record.expectedContribution, [
      "既存事業の発信力と改善速度を高める可能性があります。",
    ]),
    cautionPoints: normalizeList(record.cautionPoints, [
      "条件面と現場適応の期待値をすり合わせてください。",
    ]),
  };
}

export function isAiMatchStale(input: {
  company: Pick<Company, "updatedAt">;
  candidate: Pick<SuccessorCandidate, "updatedAt">;
  match?: Pick<
    AiMatchResult,
    "companyProfileUpdatedAt" | "candidateProfileUpdatedAt" | "promptVersion"
  > | null;
}) {
  if (!input.match) {
    return true;
  }

  return (
    input.match.promptVersion !== aiMatchPromptVersion ||
    input.match.companyProfileUpdatedAt < input.company.updatedAt ||
    input.match.candidateProfileUpdatedAt < input.candidate.updatedAt
  );
}

export function getFallbackMatch(input: {
  company: Pick<Company, "name" | "status">;
  candidate: Pick<
    SuccessorCandidate,
    | "region"
    | "desiredIndustries"
    | "skills"
    | "career"
    | "selfPr"
    | "aiUsageLevel"
    | "fieldExperienceLevel"
    | "successionMotivationLevel"
    | "isFeatured"
  >;
}): MatchOutput {
  const base =
    input.candidate.aiUsageLevel * 10 +
    input.candidate.fieldExperienceLevel * 10 +
    input.candidate.successionMotivationLevel * 12;
  const profileDepth =
    Math.min(input.candidate.career.length, 300) / 12 +
    Math.min(input.candidate.selfPr.length, 300) / 12;
  const focusBonus =
    input.candidate.desiredIndustries.length * 2 +
    input.candidate.skills.length * 2 +
    (input.candidate.isFeatured ? 6 : 0);
  const score = clampScore(base / 2.2 + profileDepth + focusBonus);

  return {
    score,
    reasons: [
      `${input.candidate.region}を軸にした地域理解と現場適応が期待できます。`,
      `希望業種が${input.candidate.desiredIndustries.slice(0, 3).join("、")}に集中しています。`,
      `承継意欲スコアが${input.candidate.successionMotivationLevel}/5で、初回面談に進める価値があります。`,
    ],
    strengths: [
      `スキル: ${input.candidate.skills.slice(0, 3).join("、")}`,
      `AI活用度 ${input.candidate.aiUsageLevel}/5`,
      `現場経験 ${input.candidate.fieldExperienceLevel}/5`,
    ],
    concerns: [
      "企業側の具体的な承継課題との一致度は面談で確認してください。",
      "資金面、稼働可能時期、現場常駐可否は未評価です。",
    ],
    recommendation: `${input.company.name}の課題を共有し、候補者の現場投入力と改善提案の具体性を確認してください。`,
    expectedContribution: [
      "既存事業の改善テーマを若い視点で再整理できる可能性があります。",
      "発信、業務改善、現場推進のいずれかで初期成果が期待できます。",
    ],
    cautionPoints: [
      "承継後の役割、裁量、責任範囲を早めにすり合わせてください。",
      "短期成果だけでなく、現場信頼の作り方を確認してください。",
    ],
  };
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function generateMatchWithOpenAI(input: {
  company: Company;
  candidate: SuccessorCandidate;
}) {
  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  const response = await client.responses.create({
    model: aiMatchModel,
    input: [
      {
        role: "system",
        content:
          "あなたは事業承継プラットフォームのマッチング審査員です。企業と後継者候補の相性を、事業承継の実現可能性、現場適応、成長余地、リスクの観点で評価してください。必ず日本語で、誇張せず実務的に返してください。",
      },
      {
        role: "user",
        content: JSON.stringify({
          company: {
            name: input.company.name,
            slug: input.company.slug,
            status: input.company.status,
            billingPlan: input.company.billingPlan,
          },
          candidate: {
            name: input.candidate.name,
            age: input.candidate.age,
            region: input.candidate.region,
            desiredIndustries: input.candidate.desiredIndustries,
            skills: input.candidate.skills,
            career: input.candidate.career,
            selfPr: input.candidate.selfPr,
            aiUsageLevel: input.candidate.aiUsageLevel,
            fieldExperienceLevel: input.candidate.fieldExperienceLevel,
            successionMotivationLevel:
              input.candidate.successionMotivationLevel,
            reviewStatus: input.candidate.reviewStatus,
            isFeatured: input.candidate.isFeatured,
          },
        }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "successor_match_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            reasons: {
              type: "array",
              minItems: 3,
              maxItems: 5,
              items: { type: "string" },
            },
            strengths: {
              type: "array",
              minItems: 2,
              maxItems: 5,
              items: { type: "string" },
            },
            concerns: {
              type: "array",
              minItems: 1,
              maxItems: 5,
              items: { type: "string" },
            },
            recommendation: { type: "string" },
            expectedContribution: {
              type: "array",
              minItems: 1,
              maxItems: 5,
              items: { type: "string" },
            },
            cautionPoints: {
              type: "array",
              minItems: 1,
              maxItems: 5,
              items: { type: "string" },
            },
          },
          required: [
            "score",
            "reasons",
            "strengths",
            "concerns",
            "recommendation",
            "expectedContribution",
            "cautionPoints",
          ],
        },
      },
    },
  });

  const parsed = JSON.parse(response.output_text);
  return normalizeMatchOutput(parsed);
}

export async function recalculateAiMatch(input: {
  company: Company;
  candidate: SuccessorCandidate;
  forceFallback?: boolean;
}) {
  let output: MatchOutput | null = null;
  let isFallback = false;

  if (!input.forceFallback) {
    try {
      output = await generateMatchWithOpenAI(input);
    } catch {
      output = null;
    }
  }

  if (!output) {
    output = getFallbackMatch(input);
    isFallback = true;
  }

  return prisma.aiMatchResult.upsert({
    where: {
      companyId_candidateId: {
        companyId: input.company.id,
        candidateId: input.candidate.id,
      },
    },
    create: {
      companyId: input.company.id,
      candidateId: input.candidate.id,
      score: output.score,
      reasons: output.reasons,
      strengths: output.strengths,
      concerns: output.concerns,
      recommendation: output.recommendation,
      expectedContribution: output.expectedContribution,
      cautionPoints: output.cautionPoints,
      model: isFallback ? "fallback" : aiMatchModel,
      promptVersion: aiMatchPromptVersion,
      isFallback,
      companyProfileUpdatedAt: input.company.updatedAt,
      candidateProfileUpdatedAt: input.candidate.updatedAt,
      calculatedAt: new Date(),
    },
    update: {
      score: output.score,
      reasons: output.reasons,
      strengths: output.strengths,
      concerns: output.concerns,
      recommendation: output.recommendation,
      expectedContribution: output.expectedContribution,
      cautionPoints: output.cautionPoints,
      model: isFallback ? "fallback" : aiMatchModel,
      promptVersion: aiMatchPromptVersion,
      isFallback,
      companyProfileUpdatedAt: input.company.updatedAt,
      candidateProfileUpdatedAt: input.candidate.updatedAt,
      calculatedAt: new Date(),
    },
  });
}

export async function ensureAiMatch(input: {
  company: Company;
  candidate: SuccessorCandidate;
  existingMatch?: AiMatchResult | null;
}): Promise<AiMatchResult> {
  const stale = isAiMatchStale({
      company: input.company,
      candidate: input.candidate,
      match: input.existingMatch,
    });

  if (!stale && input.existingMatch) {
    return input.existingMatch;
  }

  return recalculateAiMatch({
    company: input.company,
    candidate: input.candidate,
  });
}
