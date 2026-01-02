import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export async function GET(req, { params }) {
  try {
    const filePath = path.join(process.cwd(), "content/docs", `${params.slug}.md`);
    const raw = await fs.readFile(filePath, "utf-8");
    const { content, data } = matter(raw);

    return new Response(JSON.stringify({ ok: true, content, meta: data }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function POST(req, { params }) {
  try {
    const body = await req.json();
    const { content } = body;

    const dir = path.join(process.cwd(), "content/docs");
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${params.slug}.md`);
    await fs.writeFile(filePath, content, "utf-8");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}