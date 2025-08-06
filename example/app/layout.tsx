import cn from 'clsx'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang='en'
      className={cn(
        GeistMono.variable,
        GeistSans.variable,
        'text-gray-900 antialiased tracking-tight h-full'
      )}
    >
      <body className='min-h-full'>{children}</body>
    </html>
  )
}
