/**
 * 홈 페이지
 * Sanity Studio의 '사이트 설정'에서 텍스트를 관리합니다.
 */

import Link from 'next/link'
import { getAllEpisodes, getSiteSettings, defaultSettings } from '@/lib/sanity'

export const revalidate = 60

export default async function HomePage() {
  const [episodes, settings] = await Promise.all([
    getAllEpisodes(),
    getSiteSettings(),
  ])

  const s = { ...defaultSettings, ...settings }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* 사이트 이름 */}
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {s.siteTitle}
        </h1>

        {/* 부제 */}
        {s.siteSubtitle && (
          <p className="mt-2 text-sm italic text-muted-foreground">
            {s.siteSubtitle}
          </p>
        )}

        {/* 구분선 */}
        <div className="mt-8 h-px w-12 bg-border" />

        {/* 홈 문구 */}
        <p className="mt-8 font-serif text-lg leading-relaxed text-muted-foreground">
          {s.heroText}
        </p>

        {/* 에피소드 수 */}
        {episodes.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground/60">
            {episodes.length}편의 이야기
          </p>
        )}

        {/* CTA */}
        <Link
          href="/universe"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          {s.ctaText || '이야기 시작하기'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
