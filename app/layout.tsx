import './globals.css'
import React from 'react'
import Sidebar from './components/Sidebar'

export const metadata = {
  title: 'Wiki',
  description: 'Markdown Wiki',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: 24 }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
