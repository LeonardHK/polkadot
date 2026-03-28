/**
 * 에피소드 허브 페이지 (/universe)
 * 모든 공개된 에피소드를 카드 그리드로 표시
 *
 * [변경사항]
 * - 서버/클라이언트 컴포넌트 분리 (장르 필터는 클라이언트)
 * - 다크모드 토글 추가
 * - 장르 필터 UI 추가
 * - 디자인 업그레이드
 */

import { getAllEpisodes, getAvailableGenres } from '@/lib/sanity'
import { Metadata } from 'next'
import Link from 'next/link'
import ThemeToggle from '@/components/theme-toggle'
import EpisodeHub from '@/components/episode-hub'

// Sanity에서 콘텐츠 변경 시 60초 후 자동 갱신 (Redeploy 없이 새 에피소드 반영)
export const revalidate = 60

export const metadata: Metadata = {
  title: '유니버스 | 폴카도트',
  description: '폴카도트 시리즈의 모든 에피소드를 만나보세요',
}

export default async function UniversePage() {
  const [episodes, genres] = await Promise.all([
    getAllEpisodes(),
    getAvailableGenres(),
  ])

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                홈으로
              </Link>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                유니버스
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {episodes.length}편의 이야기
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 콘텐츠 */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <EpisodeHub episodes={episodes} genres={genres} />
      </section>
    </main>
  )
}
