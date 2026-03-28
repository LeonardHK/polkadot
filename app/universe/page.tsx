/**
 * 에피소드 허브 페이지 (/universe)
 * '작품 목록 이름'은 Sanity Studio의 사이트 설정에서 관리합니다.
 */

import { getAllEpisodes, getAvailableGenres, getSiteSettings, defaultSettings } from '@/lib/sanity'
import Link from 'next/link'
import ThemeToggle from '@/components/theme-toggle'
import EpisodeHub from '@/components/episode-hub'

// Sanity에서 콘텐츠 변경 시 60초 후 자동 갱신
export const revalidate = 60

export default async function UniversePage() {
  const [episodes, genres, settings] = await Promise.all([
    getAllEpisodes(),
    getAvailableGenres(),
    getSiteSettings(),
  ])

  const s = { ...defaultSettings, ...settings }

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
                {s.collectionTitle}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.collectionDescription || `${episodes.length}편의 이야기`}
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
