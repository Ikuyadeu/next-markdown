import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'

export default async function Sidebar() {
  const dir = path.join(process.cwd(), 'content', 'docs')
  let files = []
  try {
    files = await fs.readdir(dir)
  } catch (e) {
    return (
      <aside style={{ padding: 16, width: 240, borderRight: '1px solid #eee' }}>
        <p>ドキュメントが見つかりません。</p>
      </aside>
    )
  }

  const items = (
    await Promise.all(
      files
        .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
        .map(async (file) => {
          const slug = file.replace(/\.mdx?$/, '')
          const raw = await fs.readFile(path.join(dir, file), 'utf8')
          const { data } = matter(raw)
          return { slug, title: data.title || slug }
        })
    )
  ).sort((a, b) => a.title.localeCompare(b.title))

  return (
    <aside style={{ padding: 16, width: 260, borderRight: '1px solid #eee' }}>
      <h3 style={{ marginTop: 0 }}>Docs</h3>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((it) => (
            <li key={it.slug} style={{ marginBottom: 8 }}>
              <Link href={`/wiki/${it.slug}`}>{it.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
