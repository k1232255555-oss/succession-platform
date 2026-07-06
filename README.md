# Legacy Gate

次世代型・事業承継マッチングプラットフォームの企業側ダッシュボードです。Next.js App Router、Tailwind CSS、Prisma、PostgreSQL を前提にしています。

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
STRIPE_STANDARD_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_ENTERPRISE_PRICE_ID=
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

Stripe Checkout、Customer Portal、Webhook を使う場合は以下を設定します。Freeプランのみで運用する間は空でもビルドは通ります。

```bash
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STANDARD_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_ENTERPRISE_PRICE_ID=
```

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
- `MEMBER`: 候補者閲覧、スカウト、メッセージ対応が可能
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

## 監査ログ検索

`/settings/audit` で監査ログを検索できます。`OWNER / ADMIN` のみ閲覧可能です。

検索条件:

- キーワード: メール、名前、IP、User-Agent
- 操作種別
- 操作者

表示件数は直近100件までです。ログには `metadata` も表示されるため、候補者ID、スカウトID、対象ユーザーなどの追跡に使えます。

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

## スカウト管理

`/scouts` で候補者へのスカウト依頼と進行状況を管理できます。

主な流れ:

1. `/candidates` で候補者を検索
2. `/candidates/[id]` で詳細を確認
3. スカウト文、希望面談日時、マッチング料発生確認を入力して送信
4. `/scouts` で状態を更新

スカウト状態:

- `SENT`: 送信済み
- `IN_REVIEW`: 確認中
- `MEETING`: 面談調整
- `ACCEPTED`: 承諾
- `DECLINED`: 辞退
- `CANCELED`: 取消

権限:

- `OWNER / ADMIN / MEMBER`: スカウト送信と状態更新が可能
- `VIEWER`: 閲覧のみ

スカウト作成と状態更新は監査ログに記録されます。`feeAcknowledged` により、マッチング料発生を確認したうえで送信した履歴もDBに残ります。

## Stripe決済

`/settings/billing` でプラン、利用状況、Checkout、Customer Portal、請求履歴を管理できます。

プラン:

- `FREE`: ユーザー1名、候補者表示5名、月間スカウト1件
- `STANDARD`: ユーザー3名、候補者表示50名、月間スカウト10件
- `PREMIUM`: ユーザー10名、候補者表示200名、月間スカウト50件
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

支払い失敗時は会社の `billingStatus` を `PAST_DUE` に更新し、新規スカウト送信を止めます。既存データの閲覧は止めません。

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
