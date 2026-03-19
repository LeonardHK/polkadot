/**
 * 루트 레이아웃 컴포넌트
 * 한국어 단편 소설 웹앱의 전역 레이아웃 설정
 */

import type { Metadata, Viewport } from 'next'
import { Noto_Serif_KR, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// 한국어 본문용 폰트 (Noto Serif KR)
const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
})

// UI 요소용 폰트 (Geist)
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

// 메타데이터 설정
export const metadata: Metadata = {
  title: '폴카도트 | 한국어 단편 소설',
  description: '몰입감 있는 한국어 단편 소설 리더 경험',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

// 뷰포트 설정 (모바일 최적화)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#faf9f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} ${geist.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
