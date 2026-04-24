# OTC期限管理システム

一般用医薬品（OTC）の賞味期限・使用期限をiPhoneで管理するPWAアプリです。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| DB | PostgreSQL (Supabase) |
| ORM | Prisma |
| UI | Tailwind CSS |
| バーコード | BarcodeDetector API / zxing-js (フォールバック) |
| LINE通知 | LINE Messaging API |
| ホスティング | Vercel |
| PWA | next-pwa |

## セットアップ手順

### 1. リポジトリのクローン・依存インストール

```bash
git clone <your-repo>
cd otc-manager
npm install
```

### 2. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. Settings → Database → Connection string → URI をコピー

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
# .env.local を編集して DATABASE_URL などを設定
```

### 4. DBマイグレーション

```bash
npm run db:push       # 開発時（スキーマをそのままPush）
# または
npm run db:migrate    # 本番向けマイグレーションファイルを生成
```

### 5. 開発サーバー起動

```bash
npm run dev
# http://localhost:3000 で起動
```

## Vercel デプロイ

### 環境変数の設定（Vercel Dashboard）

```
DATABASE_URL          = Supabaseの接続文字列
LINE_CHANNEL_ACCESS_TOKEN = LINEアクセストークン
LINE_USER_ID          = LINE通知先ユーザーID
CRON_SECRET           = 任意のランダム文字列
```

### Cron Job 設定

`vercel.json` に設定済み。毎日 UTC 00:00（JST 09:00）に自動実行されます。

```json
{
  "crons": [{ "path": "/api/alerts/check", "schedule": "0 0 * * *" }]
}
```

### デプロイコマンド

```bash
npx vercel --prod
```

## LINE Messaging API 設定

1. [LINE Developers](https://developers.line.biz) でチャネル作成（Messaging API）
2. Channel access token（長期）を発行
3. 自分のLINE User ID を確認（[LINE API公式ドキュメント参照](https://developers.line.biz/ja/docs/messaging-api/getting-user-ids/)）
4. `.env.local` に設定
5. 設定画面のテスト通知ボタンで確認

## iPhoneでのPWAインストール

1. Safariでアプリを開く
2. 共有ボタン → 「ホーム画面に追加」
3. アイコン名を確認して「追加」

> **注意**: `public/icons/` に `icon-192.png` と `icon-512.png` を配置してください。

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx              # ダッシュボード
│   ├── scan/page.tsx         # バーコードスキャン
│   ├── inventory/
│   │   ├── page.tsx          # 在庫一覧
│   │   └── [productId]/      # 在庫詳細
│   ├── import/page.tsx       # CSV取込
│   ├── settings/page.tsx     # 設定
│   └── api/                  # API Routes
│       ├── products/         # 商品CRUD
│       ├── lots/             # ロットCRUD
│       ├── import/           # CSV処理
│       ├── alerts/           # アラート
│       ├── line/             # LINE通知
│       ├── unmatched/        # 未割当
│       └── dashboard/        # ダッシュボード集計
├── components/
│   ├── layout/               # BottomNav, PageHeader
│   ├── scanner/              # BarcodeScanner
│   ├── inventory/            # LotCard
│   └── ui/                   # Button, Input, Badge, Toast
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── prisma.ts             # Prismaクライアント
│   ├── date.ts               # JST日付ユーティリティ
│   ├── api.ts                # API helpers, LINE送信
│   └── utils.ts              # cn()
└── types/
    └── index.ts
```

## CSV フォーマット

POSレジのCSVは以下のヘッダー形式を想定しています。
POS変更時は `src/lib/api.ts` の `parseCsvRow()` 関数のみ修正してください。

```csv
JANコード,商品名,数量,取引日,取引ID
4987107609618,ロキソニンS,3,2025-04-01,TXN-001
```

## API エンドポイント一覧

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/products` | 商品一覧（検索・フィルタ） |
| POST | `/api/products` | 商品新規登録 |
| GET | `/api/products/[id]` | 商品詳細 |
| PUT | `/api/products/[id]` | 商品更新 |
| GET | `/api/products/jan/[code]` | JANコード検索 |
| GET | `/api/lots?productId=` | ロット一覧 |
| POST | `/api/lots` | ロット登録（入荷） |
| PUT | `/api/lots/[id]` | ロット数量修正 |
| DELETE | `/api/lots/[id]` | ロット論理削除 |
| POST | `/api/lots/[id]/dispose` | 廃棄登録 |
| POST | `/api/import` | CSVプレビュー |
| POST | `/api/import/execute` | CSV消し込み実行 |
| GET | `/api/unmatched` | 未割当一覧 |
| PUT | `/api/unmatched/[id]/resolve` | 未割当を解決済みに |
| GET | `/api/dashboard` | ダッシュボード集計 |
| POST | `/api/alerts/check` | アラートチェック（Cron） |
| GET | `/api/alerts/log` | 通知履歴 |
| POST | `/api/line/test` | LINEテスト通知 |
