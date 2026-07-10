# Succession Club

未来へ、事業をつなぐ。Succession Club は、後継者不足に悩む事業者と、事業を引き継いで挑戦したい人をつなぐ、双方向の事業承継マッチングサービスです。

M&A、親族承継、従業員承継を否定せず、承継に向き合う人にとってのもう一つの選択肢として設計します。AIや承継ブリーフは中心価値ではなく、マッチング前の整理と対話を補助する参考機能です。

## ブランド方針

- Mission: 日本の黒字廃業を減らし、技術・雇用・地域経済を未来へつなぐ
- Tagline: 未来へ、事業をつなぐ。
- Succession Club は、M&A、親族承継、従業員承継を否定しません
- 事業者と引き継ぎ希望者の双方にとって納得できる対話を重視します
- 実績、統計、参考分析は必ず根拠を持って表示します
- AIは意思決定を代替せず、承継検討の参考情報として扱います
- 事業者、引き継ぎ希望者、従業員、家族それぞれにとって最善かを判断基準にします
- 短期売上より長期的な信頼を優先します
- 誇張表現、根拠のない人数表示、利用実績の水増しは禁止です
- 現在は招待制クローズドβとして、審査制で最大10社まで無料運用します

## 現在の構成

- Next.js App Router
- Vercel運用前提
- Basic認証ゲートは `src/proxy.ts` で維持
- アプリ内ログインは HTTP only Cookie + DB session
- DBは PostgreSQL
- ORMは Prisma 6系
- 権限は `OWNER / ADMIN / MEMBER / VIEWER`
- 監査ログは `AuditLog`
- Stripe連携用に会社レコードへ `stripeCustomerId` / `stripeSubscriptionId` を保持
- 承継ブリーフは、マッチング前の論点整理を支える補助機能として蓄積

## 開発

```bash
npm install
npm run dev
```

## 本番前チェック

```bash
npm run verify
```

このコマンドで lint、TypeScript、production build をまとめて確認します。

## 環境変数

`.env.example` を参考に Vercel の Environment Variables を設定します。

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

BASIC_AUTH_USER=your-basic-user
BASIC_AUTH_PASSWORD=your-basic-password

ALLOW_BOOTSTRAP_ADMIN=false

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BILLING_ENABLED=false
STRIPE_STANDARD_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_ENTERPRISE_PRICE_ID=

OPENAI_API_KEY=
OPENAI_MATCHING_MODEL=gpt-5.5-mini

NOTIFICATION_EMAILS_ENABLED=false
RESEND_API_KEY=
EMAIL_FROM=Succession Club <no-reply@your-production-domain.example>
NOTIFICATION_REPLY_TO=
CONTACT_TO_EMAIL=
SUPPORT_EMAIL=
```

## DBセットアップ

### おすすめDB

2026年時点では、Vercel Postgres は新規作成できません。Vercel公式ドキュメントでも、新規プロジェクトは Marketplace の Postgres integration を使う案内になっています。

このプロジェクトでは **Neon** を推奨します。理由は、Vercel Marketplace から入れられる、無料枠から始められる、Vercelへの環境変数注入が簡単、PostgreSQLそのものなので Prisma と相性がよい、の4点です。

候補:

- Neon: 推奨。Vercel Marketplace連携が一番簡単
- Supabase Postgres: 管理画面が分かりやすい。将来 Supabase Auth/Storage を使うなら有力
- Vercel Postgres: 新規提供は終了。既存DBがある場合のみ継続利用

### Vercel画面での作業

1. Vercel Dashboard を開く
2. 対象プロジェクト `succession-platform` を開く
3. 上部または左メニューの `Storage` または `Integrations` を開く
4. Marketplace で `Neon` を検索
5. `Neon` を選び、`Install` または `Add Integration`
6. `Create New Neon Account` を選ぶ
7. 作成先の Vercel Project に `succession-platform` を選ぶ
8. Region は近い場所を選ぶ。日本向けなら Tokyo があれば Tokyo、なければ Singapore など近いリージョン
9. 作成後、Vercel Project の `Settings` → `Environment Variables` を開く
10. `DATABASE_URL` が入っていることを確認

Neon連携で複数のURLが入ることがあります。このプロジェクトで必須なのは Prisma が読む `DATABASE_URL` です。

### Vercelに入れる環境変数

Production に最低限入れる値:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
BASIC_AUTH_USER=your-basic-user
BASIC_AUTH_PASSWORD=your-basic-password
ALLOW_BOOTSTRAP_ADMIN=false
```

Stripe Checkout、Customer Portal、Webhook を使う場合は以下を設定します。初期リリースは `STRIPE_BILLING_ENABLED=false` のβ無料運用です。StripeコードとBilling画面は残しますが、CheckoutとCustomer Portalは課金開始まで無効です。

```bash
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BILLING_ENABLED=false
STRIPE_STANDARD_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_ENTERPRISE_PRICE_ID=
```

参考分析でOpenAI APIを使う場合は以下を設定します。未設定でも簡易スコアへフォールバックします。

```bash
OPENAI_API_KEY=
OPENAI_MATCHING_MODEL=gpt-5.5-mini
```

メール通知を使う場合は以下を設定します。未設定でも対話申請、メッセージ、決済処理は止まりません。通知ログは `SKIPPED` として保存されます。

```bash
NOTIFICATION_EMAILS_ENABLED=true
RESEND_API_KEY=
EMAIL_FROM=Succession Club <no-reply@your-production-domain.example>
NOTIFICATION_REPLY_TO=
CONTACT_TO_EMAIL=operator@example.com
SUPPORT_EMAIL=
```

`/contact` の問い合わせフォームは、`RESEND_API_KEY`、`EMAIL_FROM`、`CONTACT_TO_EMAIL` がすべて設定されている場合のみ運営宛にメール通知します。未設定の場合も画面上は受付完了とし、サーバーログに受付内容を記録します。`SUPPORT_EMAIL` を設定した場合のみ問い合わせページに公開連絡先として表示します。

### migration か db:push か

本番は **migration 推奨** です。

このリポジトリには初期 migration を追加済みです。

```text
prisma/migrations/20260706000000_initial_auth_schema/migration.sql
```

初回本番DBにも以下を使います。

```bash
npm run db:migrate
```

`db:push` は試作や空DBの一発反映には便利ですが、変更履歴が残りません。本番DBでは、将来の変更を追跡できる `migrate deploy`、つまりこのプロジェクトの `npm run db:migrate` を使ってください。

### コマンドでの作業

Vercel CLIを使う場合:

```bash
cd succession-platform
npm install
vercel env pull .env.local
npm run db:migrate
npm run verify
```

Vercel CLIを使わない場合:

1. Vercelの環境変数画面から `DATABASE_URL` をコピー
2. ローカルに `.env.local` を作る
3. `.env.local` に `DATABASE_URL=...` を貼る
4. 以下を実行

```bash
npm run db:generate
npm run db:migrate
```

失敗したら、まず `DATABASE_URL` の末尾に `?sslmode=require` があるか確認してください。

## 初期OWNER作成

### 安全な流れ

1. Vercel Dashboard → Project → `Settings` → `Environment Variables`
2. `ALLOW_BOOTSTRAP_ADMIN` を `true` に変更
3. `Save`
4. Vercel Dashboard → Project → `Deployments`
5. 最新デプロイの `Redeploy` を実行
6. Basic認証を通る
7. `https://your-production-domain.example/setup` を開く
8. 企業名、企業スラッグ、OWNERユーザー、12文字以上のパスワードを登録
9. 作成が成功したら、自動でダッシュボードに移動
10. Vercel Dashboard → Project → `Settings` → `Environment Variables`
11. `ALLOW_BOOTSTRAP_ADMIN` を `false` に戻す、または削除
12. `Save`
13. 再度 `Deployments` → `Redeploy`
14. `/setup` にアクセスして 404 になることを確認
15. `/login` から作成したOWNERでログインできることを確認

`/setup` は既存ユーザーが1件でも存在する場合は利用できません。

### 重要

`ALLOW_BOOTSTRAP_ADMIN=true` のまま放置しないでください。既存ユーザーが1件でもあれば追加作成は止まりますが、初期セットアップ入口が見える状態は本番運用として不要です。

## 失敗しやすいポイント

### `DATABASE_URL` がない

症状:

- Vercel build が Prisma 関連で失敗
- `/login` や `/setup` がエラーになる

確認:

- Vercel → Project → `Settings` → `Environment Variables`
- `DATABASE_URL` が Production に入っているか

### DBにテーブルがない

症状:

- `/setup` で `CompanyUser` などのテーブルがないと言われる

対応:

```bash
npm run db:migrate
```

### `ALLOW_BOOTSTRAP_ADMIN=true` にしたのに `/setup` が404

原因:

- 環境変数変更後に Redeploy していない

対応:

- Vercel → `Deployments` → 最新デプロイ → `Redeploy`

### Basic認証で先に止まる

これは正常です。Basic認証はまだ残しています。

流れ:

1. Basic認証を入力
2. `/setup` または `/login` に入る
3. アプリ内ログインを行う

### OWNER作成後に `/setup` が使えない

正常です。既存ユーザーが1件でもある場合、`/setup` は閉じます。

### `db:push` を使ってよいか迷う

本番では使わない方針です。今回から migration を作ったので、基本は `npm run db:migrate` で進めます。

## ログイン

`/login` から企業アカウントでログインします。ログイン成功、ログイン失敗、ログアウト、初期OWNER作成は監査ログへ記録されます。

アプリ認証にはログイン試行制限があります。15分以内に同じメールアドレスまたは同じIPから5回以上失敗すると、一時的にログインを止めます。試行履歴は `LoginAttempt` テーブルに保存されます。

## 権限管理

`/settings/security` で権限一覧と最新の監査ログを確認できます。
`/settings/users` で社内ユーザーを管理できます。

- `OWNER`: 全権限。請求、ユーザー管理、監査ログ確認が可能
- `ADMIN`: ユーザー管理と監査ログ確認が可能
- `MEMBER`: 候補者閲覧、対話申請、メッセージ対応が可能
- `VIEWER`: 閲覧のみ

ユーザー管理でできること:

- ユーザー作成
- 権限変更
- アカウント有効化・停止
- パスワード再設定
- セッション失効

安全対策:

- 最後の `OWNER` は停止または降格できません。
- `ADMIN` は `OWNER` を変更できません。
- 自分自身は停止できません。
- ユーザー作成、更新、パスワード再設定、セッション失効は監査ログに記録されます。

## セキュリティ

本番向けの基本防御をアプリ側で有効化しています。

- Basic認証ゲートは維持
- HTTP only / Secure / SameSite=Lax のセッションCookie
- Server Actions の更新系処理で同一オリジン確認
- CSP、HSTS、Referrer-Policy、X-Frame-Options、X-Content-Type-Options
- Cross-Origin-Opener-Policy、Cross-Origin-Resource-Policy
- ログイン試行制限
- 重要操作の監査ログ

外部公開前に、Vercelの本番URLと `NEXT_PUBLIC_APP_URL` が一致していることを確認してください。独自ドメイン追加時は、環境変数を更新してRedeployします。

## ヘルスチェック

`/api/health` でアプリとDB接続の簡易確認ができます。Basic認証が有効な本番では、通常のBasic認証を通したうえで確認します。

正常時:

```json
{
  "ok": true,
  "database": "ok",
  "environment": {
    "required": {
      "DATABASE_URL": true,
      "NEXT_PUBLIC_APP_URL": true
    }
  },
  "latencyMs": 12
}
```

DB接続に失敗している場合は HTTP 503 と `database: "unavailable"` を返します。

## 法務ページ

正式公開前の導線として以下を用意しています。

- `/terms`: 利用規約
- `/privacy`: プライバシーポリシー
- `/commercial-transaction`: 特定商取引法に基づく表記
- `/contact`: お問い合わせ

参考分析は補助情報であり、候補者の採用、承継、契約締結、投資判断を自動決定しない旨を明記しています。

正式公開前に、運営会社名、所在地、責任者、問い合わせメール、返金条件、個人情報の削除依頼フローを実態に合わせて法務確認してください。

## 監査ログ検索

`/settings/audit` で監査ログを検索できます。`OWNER / ADMIN` のみ閲覧可能です。

検索条件:

- キーワード: メール、名前、IP、User-Agent
- 操作種別
- 操作者

表示件数は直近100件までです。ログには `metadata` も表示されるため、候補者ID、対話申請ID、対象ユーザーなどの追跡に使えます。

## 後継者候補管理

候補者機能は Prisma + PostgreSQL の `SuccessorCandidate` テーブルで管理します。

主な画面:

- `/candidates`: 候補者一覧、検索、フィルター
- `/candidates/[id]`: 候補者詳細プロフィール
- `/candidates/admin`: OWNER専用の候補者管理
- `/candidates/admin/new`: OWNER専用の候補者登録
- `/candidates/admin/[id]/edit`: OWNER専用の候補者編集

権限:

- `OWNER`: 候補者の登録、編集、削除、閲覧が可能
- `ADMIN / MEMBER / VIEWER`: 候補者の閲覧のみ可能

候補者の作成、更新、削除、詳細閲覧は `AuditLog` に記録されます。

### 本番DBへの反映

本番では migration を使います。Vercel / Neon の `DATABASE_URL` が入っている状態で実行してください。

```bash
npm run db:migrate
```

初期候補者データを入れる場合:

```bash
npm run db:seed
```

`db:seed` は最初に見つかった会社に対して候補者を作成します。すでにその会社に候補者が存在する場合は重複投入を避けるためスキップします。

### 運用メモ

審査ステータスは以下を使います。

- `DRAFT`: 下書き
- `UNDER_REVIEW`: 審査中
- `APPROVED`: 承認済み
- `REJECTED`: 差し戻し
- `ARCHIVED`: 非公開

検索・フィルターは一覧ページのURLクエリとして保持されます。地域、希望業種、スキル、審査状態、注目候補フラグで絞り込みできます。

## 参考分析

OpenAI APIを使う場合、登録情報をもとに承継検討の参考情報を生成します。結果は `AiMatchResult` テーブルに保存され、毎回APIを呼ばないようにキャッシュします。

この分析は、採用、承継、契約締結、投資判断を自動決定するものではありません。M&A、親族承継、従業員承継を含む他の選択肢とあわせ、本人確認、面談、専門家確認、関係者との対話を通じて判断してください。

生成する内容:

- 参考スコア 0〜100
- 参考理由
- 強み
- 懸念点
- 推奨コメント
- 期待できること
- 注意点

再計算される条件:

- 企業プロフィールの `updatedAt` が分析結果より新しい
- 候補者プロフィールの `updatedAt` がAI結果より新しい
- prompt version が変わった
- OWNERが候補者詳細または候補者管理画面から参考分析の再計算を実行した

OpenAI APIが未設定または失敗した場合は、候補者プロフィールのスコア項目、希望業種、スキル、自己PR量をもとに簡易スコアを作成し、`isFallback=true` として保存します。

本番設定:

1. OpenAI PlatformでAPIキーを作成
2. Vercel → Project → Settings → Environment Variables
3. Productionに `OPENAI_API_KEY` を追加
4. 必要に応じて `OPENAI_MATCHING_MODEL` を変更
5. Redeploy

候補者一覧では `参考分析順 / 年齢 / 地域 / 経験年数` で並び替えできます。

## 対話申請管理

`/scouts` で候補者への対話申請と進行状況を管理できます。内部モデル名は既存互換のため `ScoutRequest` を維持しています。

主な流れ:

1. `/candidates` で候補者を検索
2. `/candidates/[id]` で詳細を確認
3. 対話申込文、希望面談日時、β期間中無料の確認を入力して送信
4. `/scouts` で状態を更新

対話申請状態:

- `SENT`: 送信済み
- `IN_REVIEW`: 確認中
- `MEETING`: 面談調整
- `ACCEPTED`: 承諾
- `DECLINED`: 辞退
- `CANCELED`: 取消

権限:

- `OWNER / ADMIN / MEMBER`: 対話申請と状態更新が可能
- `VIEWER`: 閲覧のみ

対話申請の作成と状態更新は監査ログに記録されます。`feeAcknowledged` は既存互換のため列名を維持し、初期リリースではβ無料確認として扱います。

## メッセージ

`/messages` で対話申請に紐づくメッセージスレッドを確認できます。

主な画面:

- `/messages`: メッセージスレッド一覧
- `/messages/[id]`: スレッド詳細、返信、既読、クローズ

仕様:

- `ScoutRequest` 1件につき `MessageThread` は1件
- スレッド状態は `OPEN / CLOSED`
- メッセージ本文はテキストとして保存し、HTMLとして描画しません
- 既読は `MessageReadReceipt` でユーザー単位に保存
- スレッド作成、送信、既読、クローズは監査ログに記録

権限:

- ログイン済みの自社ユーザーのみ、自社のスレッドを閲覧できます。
- `OWNER / ADMIN` は自社の全スレッドを確認できます。
- `MEMBER / VIEWER` も自社スレッドのみ閲覧できます。
- 自社以外のスレッドIDへ直接アクセスしても404になります。

通知:

- メッセージ送信時に同じ会社の `OWNER / ADMIN / MEMBER` へ通知ログを作成します。
- メール通知が有効な場合は Resend 経由で送信します。
- メール通知が未設定の場合も操作は失敗せず、`NotificationLog` に `SKIPPED` として保存します。

## メール通知

`/settings/notifications` で通知ログを確認できます。`OWNER / ADMIN` のみ閲覧可能です。

通知対象:

- 対話申請作成
- メッセージ送信
- メッセージスレッドのクローズ
- Stripe決済失敗

本番で有効化する手順:

1. ResendでAPIキーを作成
2. 送信元ドメインをResendで認証
3. Vercel → Project → Settings → Environment Variables を開く
4. Production に `RESEND_API_KEY` を追加
5. Production に `EMAIL_FROM` を追加
6. 問い合わせ通知を使う場合は `CONTACT_TO_EMAIL` を追加
7. 公開連絡先メールを表示する場合のみ `SUPPORT_EMAIL` を追加
8. 必要なら `NOTIFICATION_REPLY_TO` を追加
9. `NOTIFICATION_EMAILS_ENABLED` を `true` に変更
10. Redeploy

未設定または送信失敗時:

- 本体操作は継続します。
- `NotificationLog` に `SKIPPED` または `FAILED` として残ります。
- 送信失敗は監査ログにも `NOTIFICATION_EMAIL_FAILED` として記録されます。

本番反映後は migration を適用してください。

```bash
npm run db:migrate
```

## 承継ブリーフと論点整理

Succession Club の本体は、事業を残したい人と事業を引き継ぎたい人をつなぐ双方向の事業承継マッチングサービスです。

承継ブリーフは、マッチング前に事業者の状況や承継の詰まりポイントを整理し、対話や実名案件化を進めやすくするための補助機能です。匿名・構造化された承継論点データは、サービス改善と安全な論点整理のために利用します。

## 残したい事業と承継プロジェクト

双方向マッチングの前提として、事業者が「何を引き継いでほしいのか」を匿名・限定公開前提で整理できる `BusinessOpportunity` を追加しています。

外向きの表示では「事業案件」ではなく、「残したい事業」「承継プロジェクト」「引き継ぎ募集」という表現を使います。M&Aの売却案件のように見えすぎないよう、売却価格、売上、利益、借入、取引先名、会社名、代表者名、住所は扱いません。

追加URL:

- `/businesses`: 自社の残したい事業一覧
- `/businesses/new`: 承継プロジェクト登録
- `/businesses/[id]`: 自社向け詳細と匿名プレビュー
- `/businesses/[id]/edit`: 編集
- `/settings/businesses`: 運営OWNER専用の確認画面

公開範囲:

- `PRIVATE`: 自社と運営OWNERのみ確認
- `LIMITED`: 将来の限定公開準備。初期MVPでは外部表示や候補者側表示には接続しません
- `PUBLIC`: 将来用。初期MVPではUIから選択できません

状態:

- `DRAFT`: 下書き
- `IN_REVIEW`: 運営確認中
- `PUBLISHED`: 公開準備完了
- `ARCHIVED`: アーカイブ

作成直後は `PRIVATE + DRAFT` です。事業者側は運営確認へ送信でき、`PUBLISHED` や `ARCHIVED` への変更は運営OWNERが `/settings/businesses` で行います。

このMVPでは、引き継ぎ希望者からの関心あり、候補者側ログイン、双方向オファー、`ScoutRequest` / `MessageThread` 接続、課金、AI判定、公開マップ、SEO案件ページ、一般公開は作りません。

## 初期参加・協賛・応援導線

クローズドβでは、初期から取り組みに参加してくださる事業者を最大10社まで募集します。最初の10社は、初期参加事業者としてβ期間後も無料で利用できます。共同運営者の募集ではなく、事業承継の新しい選択肢を広げるための初期参加枠です。

トップページ下部に以下の補助導線を置いています。

- `/contact?topic=founding-member`: 第1期 参加事業者の相談
- `/contact?topic=sponsor`: 協賛・連携の相談
- `/contact?topic=support`: 活動応援・広報協力

運用ルール:

- サイト上で決済は受け付けません。
- 「寄付」という表現は使いません。
- 金銭支援は個別問い合わせに留めます。
- 税務・法務確認前にStripe決済や支援決済を有効化しません。
- 協賛ロゴ掲載、スポンサー一覧、領収書発行フロー、スポンサー管理DBはまだ作りません。
- SNS共有は手動シェア文言と通常リンクのみです。SNS API連携や自動投稿は行いません。

### 承継ブリーフ

`/succession-brief/new` から入力します。初期MVPではログインユーザーのみ利用できます。

保存する主な構造化データ:

- 業種
- 都道府県
- 承継段階
- 残したい価値カテゴリ
- 関係者タイプ
- 論点カテゴリ
- 未整理項目
- 次のアクション
- 公開範囲

自由記述は補足です。事業概要と相談メモは500文字以内に制限し、企業名、個人名、電話番号、住所、メールアドレスなど特定につながる情報を書かないよう画面上で案内します。

### 公開範囲

- `PRIVATE`: 本人保存用。匿名集計にも運営確認にも使いません。
- `AGGREGATE_ONLY`: 匿名集計にのみ利用します。マッチング前の論点整理を支える補助データです。
- `SHARE_WITH_OPERATOR`: 相談希望や品質確認のため、運営が内容を確認します。外部公開はしません。

相談希望がある場合は、運営が内容を確認する同意が必要です。連絡先は `SuccessionBriefContactRequest` に分離して保存し、匿名集計や分析処理から除外します。

### OWNER用集計

`/settings/succession-briefs` で OWNER のみ確認できます。

匿名集計対象:

- `visibilityScope = AGGREGATE_ONLY`
- `status != ARCHIVED`
- `sensitiveInfoFlag = false`

特定リスクを避けるため、`count < 3` の集計項目は表示しません。初期MVPでは一般公開マップ、投稿数演出、SEO記事、自動評価・診断、PDF生成、課金導線は作りません。

## Stripe決済

`/settings/billing` でプラン、利用状況、将来のCheckout、Customer Portal、請求履歴を管理できます。

初期リリースは **招待制クローズドβ** です。`STRIPE_BILLING_ENABLED=false` の間は、審査制で最大10社まで無料運用します。Stripeコード、Webhook、Billing画面は残しているため、将来 `STRIPE_BILLING_ENABLED=true` とStripe環境変数を設定すれば課金導線を有効化できます。

運用メモ:

- βでは大量集客ではなく、少数企業での課題検証を優先します。
- 無料枠は先着ではなく、運営が確認できる審査制で最大10社までとします。
- Dashboardの数字は必ずDB集計値のみを表示します。
- 架空の参加企業数、候補者数、承継対話数は表示しません。

将来のプラン設計メモ:

- `FREE`: ユーザー1名、候補者表示5名、月間対話申請1件
- `STANDARD`: ユーザー3名、候補者表示50名、月間対話申請10件
- `PREMIUM`: ユーザー10名、候補者表示200名、月間対話申請50件
- `ENTERPRISE`: 無制限、個別契約

Stripe Dashboard で必要な作業:

1. Products で `Standard`、`Premium`、必要なら `Enterprise` を作成
2. 各Productに recurring price を作成
3. Price ID を Vercel の Environment Variables に設定
4. Customer Portal を有効化
5. Webhook endpoint に `https://your-production-domain.example/api/stripe/webhook` を登録
6. Webhook signing secret を `STRIPE_WEBHOOK_SECRET` に設定

Webhookで処理するイベント:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.created`
- `invoice.finalized`
- `invoice.paid`
- `invoice.payment_failed`

支払い失敗時は会社の `billingStatus` を `PAST_DUE` に更新し、新規対話申請を止めます。既存データの閲覧は止めません。メール通知が有効な場合は `OWNER / ADMIN` に決済失敗通知を送信します。

本番反映後は migration を適用してください。

```bash
npm run db:migrate
```

## Vercel設定

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`
- Environment Variables: `.env.example` の値を本番用に設定

`postinstall` と `build` の両方で `prisma generate` が走るため、Vercel build 時にも Prisma Client が生成されます。

Vercel Runtime は Linux 系の `rhel-openssl-3.0.x` を使うため、`prisma/schema.prisma` の generator には以下を明示しています。

```prisma
provider = "prisma-client-js"
binaryTargets = ["native", "rhel-openssl-3.0.x"]
```

Prisma Client は公式の標準出力先である `@prisma/client` を使います。カスタム出力先 `src/generated/prisma` は Vercel の Serverless 出力に Query Engine が含まれない原因になりやすいため使いません。

`next.config.ts` の `outputFileTracingIncludes` でも `node_modules/.prisma/client/**` と `node_modules/@prisma/client/**` を明示的に含めています。これにより、Vercel の Function bundle に `libquery_engine-rhel-openssl-3.0.x.so.node` が入るようにしています。

## Vercel env pull で空文字になる場合

Vercel の `vercel env pull .env.local --environment=production` で次のようになる場合があります。

```bash
DATABASE_URL=""
DATABASE_URL_UNPOOLED=""
NEXT_PUBLIC_APP_URL=""
```

原因は主に2つです。

1. Vercel側の変数が Sensitive Environment Variable として作成されている
2. Vercel側でキーは存在するが、値そのものが空で保存されている

VercelのSensitive Environment Variablesは、作成後に値を読み戻せない仕様です。そのため、Vercel上の実行時には使えても、CLIでローカルにpullすると空になることがあります。

確認コマンド:

```bash
vercel env ls
vercel env pull /tmp/vercel-production-env --environment=production --yes
```

値は表示せず、長さだけ確認する場合:

```bash
awk -F= '/^(DATABASE_URL|NEXT_PUBLIC_APP_URL)=/ { gsub(/^"|"$/, "", $2); print $1 " length=" length($2) }' /tmp/vercel-production-env
```

`length=0` の場合、ローカルの `.env.local` には手で値を入れてください。Neonの場合は、Neon Dashboard の接続文字列をコピーして使います。

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://your-production-domain.example"
```

空の `.env.local` や `.env` が残っていると、Prismaは `DATABASE_URL resolved to an empty string` で失敗します。このプロジェクトでは `npm run db:migrate` と `npm run db:push` の前に `DATABASE_URL` の空チェックを行います。

## 正式リリース手順

### 1. 必須環境変数

Vercel → Project → Settings → Environment Variables → Production に以下を設定します。

```bash
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
BASIC_AUTH_USER=
BASIC_AUTH_PASSWORD=
ALLOW_BOOTSTRAP_ADMIN=false
```

`DATABASE_URL` はNeonの接続文字列です。値の末尾に `sslmode=require` があることを確認してください。

### 2. 任意環境変数

外部サービスを使う場合だけ設定します。未設定でもアプリ本体は落ちません。

Stripe:

```bash
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STANDARD_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_ENTERPRISE_PRICE_ID=
```

OpenAI:

```bash
OPENAI_API_KEY=
OPENAI_MATCHING_MODEL=gpt-5.5-mini
```

Resend:

```bash
NOTIFICATION_EMAILS_ENABLED=true
RESEND_API_KEY=
EMAIL_FROM=Succession Club <no-reply@your-production-domain.example>
NOTIFICATION_REPLY_TO=
CONTACT_TO_EMAIL=operator@example.com
SUPPORT_EMAIL=
```

### 3. 外部サービス未設定時の挙動

- Stripe未設定または `STRIPE_BILLING_ENABLED=false`: Billing画面は表示され、CheckoutとCustomer Portalはβ無料案内に戻ります。
- OpenAI未設定: 参考分析は簡易スコアへfallbackします。
- Resend未設定: メール送信は行わず、通知ログに `SKIPPED` として保存します。

### 4. デプロイ前コマンド

```bash
npm install
npm run db:migrate
npm run verify
```

### 5. Vercelでの確認

1. 最新commitをpush
2. Vercel Deploymentsでビルド成功を確認
3. `/api/health` を開き、`ok: true` と `database: "ok"` を確認
4. `/login` でOWNERログイン
5. `/candidates` → 候補者詳細 → 対話申請 → `/scouts` → `/messages` まで確認
6. `/settings` から Billing、Users、Audit、Notifications に移動できることを確認
7. `/terms`、`/privacy`、`/commercial-transaction`、`/contact` を確認

### 6. 障害時対応

DB接続エラー:

- `/api/health` の `database` を確認
- Vercelの `DATABASE_URL` がProductionに設定されているか確認
- Neonが停止または上限到達していないか確認
- `npm run db:migrate` が成功しているか確認

Stripeエラー:

- Billing画面の案内表示を確認
- `STRIPE_SECRET_KEY`、Price ID、Webhook Secretを確認
- Stripe Dashboard → Developers → Webhooks で送信結果を確認

AIエラー:

- `OPENAI_API_KEY` を確認
- 未設定でもfallbackで動くため、`AiMatchResult.isFallback` を確認

メール通知エラー:

- `/settings/notifications` で `FAILED` または `SKIPPED` を確認
- Resend API Key、送信元ドメイン認証、`EMAIL_FROM` を確認

### 7. Rollback

1. Vercel → Project → Deployments
2. 直前に正常だったDeploymentを開く
3. `Promote to Production` を実行
4. DB migrationを戻す必要がある場合は、データ互換を壊さない追加migrationで対応します。手動でテーブルや列を削除しないでください。

### 8. 本番前チェックリスト

- `npm run verify` が成功している
- `npm run db:migrate` が成功している
- `ALLOW_BOOTSTRAP_ADMIN=false`
- Basic認証が有効
- OWNERが1名以上存在する
- `/api/health` が正常
- 法務ページの会社情報と問い合わせ先が実情報になっている
- Stripe本番キーとWebhookが本番モード
- Resend送信元ドメインが認証済み
- OpenAI APIキーの利用上限と請求設定を確認済み
- 個人情報・候補者情報の削除依頼フローが決まっている

## 今後の残タスク

実際の利用者要望と運用上の必要性を確認してから着手します。

- `/settings/account` にマイページを追加
- ログイン中ユーザー本人のパスワード変更
- 公開トップを明るさ・清潔感・信頼感を重視したデザインへ刷新
