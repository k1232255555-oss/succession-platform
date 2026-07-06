# Legacy Gate

次世代型・事業承継マッチングプラットフォームの企業側ダッシュボードです。Next.js App Router と Tailwind CSS で構築しています。

## 開発

```bash
npm install
npm run dev
```

ローカルでは `http://localhost:3000` を開きます。ポートが使用中の場合は Next.js が別ポートを案内します。

## 本番前チェック

```bash
npm run verify
```

このコマンドで lint、TypeScript、production build をまとめて確認します。

## 環境変数

`.env.example` を参考に設定します。

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
BASIC_AUTH_USER=your-user
BASIC_AUTH_PASSWORD=your-password
```

`BASIC_AUTH_USER` と `BASIC_AUTH_PASSWORD` を両方設定すると、公開URL全体に Basic 認証がかかります。クローズドβや審査制プラットフォームの初期運用では、必ず本番環境に設定してください。

## デプロイ

Vercel での推奨設定:

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`
- Environment Variables: `.env.example` の値を本番用に設定

## 実装済み

- 企業側ダッシュボード
- スカウト進行状況
- 後継者候補カード
- 審査済みシグナル
- メッセージプレビュー
- Basic 認証ゲート
- セキュリティヘッダー
- 404、エラー、読み込み画面
- robots によるクローラー除外
