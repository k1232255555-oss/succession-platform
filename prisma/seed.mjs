import { CandidateReviewStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedCandidates = [
  {
    name: "Ren",
    age: 24,
    region: "福岡",
    desiredIndustries: ["食品製造", "地域ブランド", "EC"],
    skills: ["SNSマーケティング", "ショート動画", "ブランド再編集"],
    career:
      "大学時代に地域産品のD2C販売を立ち上げ、SNS経由で月商120万円規模まで成長。卒業後は中小企業向けの動画運用支援を担当。",
    selfPr:
      "眠っている地方ブランドを、世界に届く熱狂へ変えたい。現場で商品を理解し、毎日発信し、顧客の声を事業に戻す動きができます。",
    aiUsageLevel: 4,
    fieldExperienceLevel: 3,
    successionMotivationLevel: 5,
    reviewStatus: CandidateReviewStatus.APPROVED,
    isFeatured: true,
  },
  {
    name: "Mika",
    age: 22,
    region: "東京",
    desiredIndustries: ["卸売", "製造業", "BtoBサービス"],
    skills: ["AI活用", "業務自動化", "顧客管理"],
    career:
      "インターン先で受発注管理の自動化とCRM整備を担当。現場ヒアリングから要件整理、ノーコードとAIを使った試作まで経験。",
    selfPr:
      "AIで古い業務をほどき、職人や営業の時間を取り戻したい。小さな会社ほどテクノロジーの効き目は大きいと信じています。",
    aiUsageLevel: 5,
    fieldExperienceLevel: 2,
    successionMotivationLevel: 4,
    reviewStatus: CandidateReviewStatus.APPROVED,
    isFeatured: true,
  },
  {
    name: "Takumi",
    age: 26,
    region: "愛知",
    desiredIndustries: ["町工場", "物流", "建設"],
    skills: ["営業開拓", "現場改善", "体力・根性"],
    career:
      "法人営業を3年経験。新規開拓、現場同行、納期調整を担当し、泥臭い折衝と改善提案を強みにしている。",
    selfPr:
      "数字だけでは測れない事業の誇りを、次の世代に接続したい。まずは誰よりも早く現場に立ち、信頼を積み上げます。",
    aiUsageLevel: 3,
    fieldExperienceLevel: 5,
    successionMotivationLevel: 5,
    reviewStatus: CandidateReviewStatus.APPROVED,
    isFeatured: false,
  },
  {
    name: "Aoi",
    age: 23,
    region: "京都",
    desiredIndustries: ["伝統工芸", "小売", "観光"],
    skills: ["EC運営", "UX設計", "コミュニティ作り"],
    career:
      "学生団体で地域工芸品のポップアップ企画を運営。EC導線、写真、販売ページ、購入後コミュニティまで設計。",
    selfPr:
      "地域に埋もれた技術を、若い購買体験に翻訳したい。買う理由、語りたくなる理由まで設計します。",
    aiUsageLevel: 4,
    fieldExperienceLevel: 3,
    successionMotivationLevel: 4,
    reviewStatus: CandidateReviewStatus.UNDER_REVIEW,
    isFeatured: false,
  },
];

async function main() {
  const company = await prisma.company.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!company) {
    console.log("No company found. Create the initial OWNER first.");
    return;
  }

  const existingCandidates = await prisma.successorCandidate.count({
    where: {
      companyId: company.id,
    },
  });

  if (existingCandidates > 0) {
    console.log("Candidates already exist. Seed skipped.");
    return;
  }

  await prisma.successorCandidate.createMany({
    data: seedCandidates.map((candidate) => ({
      ...candidate,
      companyId: company.id,
    })),
  });

  console.log(`Seeded ${seedCandidates.length} successor candidates.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
