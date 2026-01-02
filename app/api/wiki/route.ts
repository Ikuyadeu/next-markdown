import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'content', 'docs')
    const files = await fs.readdir(dir)

    const list = await Promise.all(
      files
        .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
        .map(async (file) => {
          const slug = file.replace(/\.mdx?$/.test(file) ? /\.mdx?$/.exec(file)[0] : '', '').replace(/\.mdx?$/,'')
          const raw = await fs.readFile(path.join(dir, file), 'utf8')
          const { data, content } = matter(raw)
          const title = data.title || slug
          const excerpt = content.split('\n').find((l) => l.trim().length > 0) || ''
          return { slug, title, excerpt }
        })
    )

    // sort by title
    list.sort((a, b) => a.title.localeCompare(b.title))

    return new Response(JSON.stringify({ ok: true, items: list }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
