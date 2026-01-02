# mdx-document — Next.js Markdown Wiki テンプレート

このテンプレートは、Markdown を動的に読み込み・編集できる Wiki の雛形です。

必須パッケージ（プロジェクトに追加してください）:

```bash
npm install unified remark-parse remark-rehype rehype-react rehype-sanitize remark-gfm gray-matter
```

注: ここでは `react-markdown` を使わず、`unified` + `remark` + `rehype` を使ったパイプライン（`rehype-react` で React ノードに変換）を採用しています。これによりパーサーと AST を細かく制御できます。

カスタムコンポーネントの例:

```ts
import rehypeReact from 'rehype-react'

// パイプラインに組み込む例
.use(rehypeReact, {
  createElement: React.createElement,
  Fragment: React.Fragment,
  components: {
    a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
    code: (props) => <pre className="my-code"><code {...props} /></pre>,
  },
})
```

上記のようにコンポーネントを差し替えることで、リンクやコードブロック、カスタム要素を自由にレンダリングできます。

コードハイライト:

- `rehype-highlight` (highlight.js ベース) を導入して、コードブロックにシンタックスハイライトを追加しています。
- ハイライト用 CSS は `app/globals.css` から `highlight.js` のテーマをインポートしています。別のテーマを使う場合は `app/globals.css` の `@import` を変更してください（例: `github-dark.css`、`atom-one-dark.css` など）。

注意: グローバル CSS は `app/layout.tsx` で `globals.css` を読み込む形で設定しています。
使用方法（開発）:

1. 必要なパッケージをインストール
2. `npm run dev` で開発サーバを起動
3. `content/docs/<slug>.md` を作成すると `/wiki/<slug>` で閲覧・編集できます

注意:
- `app/api/wiki/[slug]/route.ts` は GET（読み取り）と POST（上書き保存）をサポートします。
- 書き込みはサーバー上の `content/docs` ディレクトリに行われます。権限に注意してください。


## TODO

- ナビゲーション（docs の一覧を読み出しサイドバー生成） — ナビゲーションを実装できます。
- 保存操作の保護（簡易認証 / ミドルウェア） — 公開環境での安全対策。
- Git での自動コミット（変更履歴を保持） — 継続的な編集履歴のため。
- フルテキスト検索（Lunr / Fuse.js） — ドキュメント検索を追加。
