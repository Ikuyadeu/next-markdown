# mdx-document — 設計方針とアーキテクチャまとめ

## 概要

**目的**: ローカルファイル（`content/docs/*.md`）をソースにした軽量な Markdown Wiki を Next.js（app router）で構築する。主な要件は簡単に編集・プレビューでき、ファイルとして保存できること。

## 主要な特徴

- Markdown を動的に読み書き（編集 UI + API）
- パーサーは `unified` + `remark` + `rehype` 系で細かく制御
- ファイルベース（`content/docs`）で運用可能

## 技術スタック

- フレームワーク: Next.js（app router）
- Markdown パイプライン: `unified`、`remark-parse`、`remark-gfm`、`remark-rehype`、`rehype-sanitize`、`rehype-highlight`、`rehype-react`
- フロントエンド Markdown: クライアント編集コンポーネント（`app/wiki/[slug]/page.tsx`）
- frontmatter: `gray-matter`
- ファイルI/O: Node の `fs/promises`（`content/docs` に保存）
- テストユーティリティ: `scripts/test-render.js`（サーバー側で同じパイプラインを再現して検証）

## 主要ファイル

- `content/docs/*.md` — ドキュメントのソース（frontmatter + body）
- `app/api/wiki/[slug]/route.ts` — GET（読み取り）、POST（保存）
- `app/api/wiki/route.ts` — ドキュメント一覧（Sidebar 用）
- `app/wiki/[slug]/page.tsx` — クライアント側編集／プレビュー UI
- `app/components/Sidebar.tsx` — サーバーコンポーネントで一覧を生成
- `app/layout.tsx` — サイドバーを含む 2 カラムレイアウト
- `scripts/test-render.js` — サーバー側レンダーテスト
- `app/globals.css` — グローバルスタイル / ハイライトテーマ

## データフロー（簡易）

1. ブラウザ → `GET /wiki/:slug`（ページ）
   - ページが `/api/wiki/:slug` に GET を要求
   - サーバーは `content/docs/:slug.md` を読み、`gray-matter` で分割して JSON を返す
   - クライアントは受け取った Markdown を `unified`（クライアント）で変換して表示

2. 保存フロー
   - クライアントの編集画面 → `POST /api/wiki/:slug`（body: `{content}`）
   - サーバーは `content/docs/:slug.md` に上書き保存

（補足）サーバーサイドで事前に HTML/React を生成して返す SSR 化も可能（`scripts/test-render.js` で再現済み）

## レンダリングパイプライン

```text
Markdown text
→ remark-parse
→ remark-gfm
→ remark-rehype
→ rehype-highlight（ハイライト）
→ rehype-sanitize（XSS 対策）
→ rehype-react（React 要素に変換）
→ クライアントで表示
```

- 備考: `rehype-react` は `react/jsx-runtime` の `jsx/jsxs/Fragment` を渡す実装にして型問題を回避している

## セキュリティと制約

- 現状、**認証なしでファイルを書き込み可能**。公開環境では必ず認証を追加（API トークン、OAuth、セッション等）。
- `rehype-sanitize` によるサニタイズを実施しているが、公開サービスとしては CSP や監査が必要。
- ローカル FS に直接書き込む設計のため、Vercel のような読み取り専用環境では動作しない。運用時は Git ベースの保存（コミット）や外部ストレージを検討する。

## 優先度付き改善提案（推奨順）

1. 認証・保存保護の導入（高）
2. Git コミットによる保存（履歴・PR ワークフロー）（高）
3. SSR（サーバーサイドで事前レンダリング）による SEO 改善（中）
4. 全文検索（Lunr / Fuse.js）（中）
5. サイドバーのカテゴリ階層化（frontmatter の `category` 利用）（低）
6. コードブロック機能強化（行番号、コピーボタン、テーマ切替）（低）
7. テスト・CI（ユニット / E2E、GitHub Actions）（中）

## 運用手順（開発を一旦止める際）

- 作業ブランチをマージまたはタグ付け（例: `v0.1.0`）
- `README.md` / `DESIGN.md` に停止理由と次の優先タスクを記載
- 必要なら Issue を作成し、優先順でチケット化

## 参考 / 追加資料

- サイドバー API: `app/api/wiki/route.ts`
- 編集 API: `app/api/wiki/[slug]/route.ts`
- サーバーレンダーテスト: `scripts/test-render.js`

---

次のアクションとして、これらの改善案を Issue 化（短見積もり付き）してほしいか、あるいは優先項目のうちどれを先に実装するかを教えてください。
