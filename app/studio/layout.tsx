/**
 * Sanity Studio 전용 레이아웃
 * 전역 CSS와 ThemeProvider가 Studio에 간섭하지 않도록 격리합니다.
 */

export const metadata = {
  title: 'Polkadot Studio',
  description: '작품 관리 도구',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
