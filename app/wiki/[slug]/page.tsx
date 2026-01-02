"use client";

import React, { useEffect, useState, useMemo } from "react";
import { jsx, jsxs, Fragment as JsxFragment } from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeReact from "rehype-react";

export default function WikiPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [markdown, setMarkdown] = useState<string>("");
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/wiki/${slug}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (!mounted) return;
          setMarkdown(`# ${slug}\n\n新しいページです。`);
          setMeta({ title: slug });
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        if (data.ok) {
          setMarkdown(data.content || "");
          setMeta(data.meta || {});
        } else {
          setError(data.error || "Failed to load");
        }
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(String(e));
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  async function handleSave() {
    if (!confirm("この内容で保存しますか？")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/wiki/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdown }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Save failed");
      setEditing(false);
      alert("保存しました");
    } catch (e) {
      alert("保存に失敗しました: " + String(e));
    } finally {
      setSaving(false);
    }
  }

  const rendered = useMemo(() => {
    try {
      const file = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeSanitize)
        .use(rehypeReact, { jsx, jsxs, Fragment: JsxFragment })
        .processSync(markdown);
      return (file as any).result;
    } catch (e) {
      return <pre style={{ color: "red" }}>レンダリングエラー</pre>;
    }
  }, [markdown]);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{(meta && meta.title) || slug}</h1>
        <div>
          <button onClick={() => setEditing((s) => !s)} style={{ marginRight: 8 }}>
            {editing ? "プレビュー" : "編集"}
          </button>
          {editing && (
            <button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <p>読み込み中…</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : editing ? (
        <div style={{ display: "flex", gap: 16 }}>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{ width: "50%", height: "60vh", fontFamily: "monospace", fontSize: 14 }}
          />
          <div style={{ width: "50%", height: "60vh", overflow: "auto", border: "1px solid #ddd", padding: 16 }}>
            {rendered}
          </div>
        </div>
      ) : (
        <article style={{ marginTop: 20 }}>{rendered}</article>
      )}
    </div>
  );
}