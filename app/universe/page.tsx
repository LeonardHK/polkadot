/**
 * 에피소드 허브 페이지 (/universe)
 * 모든 공개된 에피소드를 카드 그리드로 표시
 */

import { getAllEpisodes, Episode } from '@/lib/sanity'
import Link from 'next/link'
import { Metadata } from 'next'

// 페이지 메타데이터 설정
export const metadata: Metadata = {
  title: '유니버스 | 폴카도트',
  description: '폴카도트 시리즈의 모든 에피소드를 만나보세요',
}

// 에피소드 카드 컴포넌트
function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <Link
      href={`/universe/${episode.slug.current}`}
      className="group block"
    >
      {/* 카드 컨테이너 - 호버 시 살짝 위로 올라가는 효과 */}
      <article className="flex flex-col h-full rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* 에피소드 번호 뱃지 */}
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          에피소드 {episode.episodeNumber}
        </span>
        
        {/* 에피소드 제목 (한국어) */}
        <h2 className="mb-2 font-serif text-xl font-medium leading-tight text-foreground group-hover:text-primary transition-colors">
          {episode.title}
        </h2>
        
        {/* 영어 부제목 */}
        {episode.englishSubtitle && (
          <p className="mb-3 text-sm italic text-muted-foreground">
            {episode.englishSubtitle}
          </p>
        )}
        
        {/* 줄거리 요약 */}
        {episode.logline && (
          <p className="mt-auto text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {episode.logline}
          </p>
        )}
        
        {/* 공개일 */}
        {episode.publishedAt && (
          <time
            dateTime={episode.publishedAt}
            className="mt-4 text-xs text-muted-foreground"
          >
            {new Date(episode.publishedAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </article>
    </Link>
  )
}

// 에피소드가 없을 때 표시할 빈 상태 컴포넌트
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 text-6xl opacity-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-medium text-foreground">
        아직 공개된 에피소드가 없습니다
      </h2>
      <p className="text-sm text-muted-foreground">
        새로운 이야기가 곧 찾아옵니다
      </p>
    </div>
  )
}

// 메인 페이지 컴포넌트
export default async function UniversePage() {
  // Sanity에서 모든 공개된 에피소드 가져오기
  const episodes = await getAllEpisodes()

  return (
    <main className="min-h-screen bg-background">
      {/* 페이지 헤더 */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-12">
          {/* 사이트 로고/제목 */}
          <Link href="/" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← 홈으로
          </Link>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
            유니버스
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            폴카도트 시리즈의 모든 이야기
          </p>
        </div>
      </header>

      {/* 에피소드 그리드 */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        {episodes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode) => (
              <EpisodeCard key={episode._id} episode={episode} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
