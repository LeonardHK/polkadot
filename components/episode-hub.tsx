'use client'

/**
 * 에피소드 허브 (클라이언트 컴포넌트)
 * 장르 필터링 + 에피소드 카드 목록
 */

import { useState } from 'react'
import Link from 'next/link'
import { Episode, Genre, genreLabels, imageUrl } from '@/lib/sanity'
import GenreFilter from './genre-filter'

interface EpisodeHubProps {
  episodes: Episode[]
  genres: Genre[]
}

function EpisodeCard({ episode }: { episode: Episode }) {
  const cover = imageUrl(episode.coverImage, 600, 400)
  const readTime = episode.estimatedReadTime ||
    Math.max(1, Math.ceil(((episode as any).paragraphCount || 0) * 200 / 500))

  return (
    <Link href={`/universe/${episode.slug.current}`} className="group block">
      <article className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* 커버 이미지 */}
        {cover && (
          <div className="aspect-[3/2] overflow-hidden bg-secondary">
            <img
              src={cover}
              alt={episode.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          {/* 상단 메타: 에피소드 번호 + 장르 */}
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              EP.{episode.episodeNumber}
            </span>
            {episode.genre && (
              <span className="text-xs text-muted-foreground/70">
                {genreLabels[episode.genre] || episode.genre}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h2 className="mb-1.5 font-serif text-lg font-medium leading-tight text-card-foreground group-hover:text-foreground transition-colors">
            {episode.title}
          </h2>

          {/* 영문 부제 */}
          {episode.englishSubtitle && (
            <p className="mb-2 text-xs italic text-muted-foreground">
              {episode.englishSubtitle}
            </p>
          )}

          {/* 로그라인 */}
          {episode.logline && (
            <p className="mt-auto text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {episode.logline}
            </p>
          )}

          {/* 하단 메타 */}
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground/60">
            {episode.publishedAt && (
              <time dateTime={episode.publishedAt}>
                {new Date(episode.publishedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            )}
            {readTime > 0 && (
              <span>약 {readTime}분</span>
            )}
          </div>

          {/* 태그 */}
          {episode.tags && episode.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {episode.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground/50">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-muted-foreground/40">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
      <h2 className="mb-2 font-serif text-lg font-medium text-foreground">
        아직 공개된 에피소드가 없습니다
      </h2>
      <p className="text-sm text-muted-foreground">
        새로운 이야기가 곧 찾아옵니다
      </p>
    </div>
  )
}

export default function EpisodeHub({ episodes, genres }: EpisodeHubProps) {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)

  const filteredEpisodes = selectedGenre
    ? episodes.filter((ep) => ep.genre === selectedGenre)
    : episodes

  return (
    <>
      {/* 장르 필터 */}
      {genres.length > 0 && (
        <div className="mb-8">
          <GenreFilter
            genres={genres}
            selected={selectedGenre}
            onSelect={setSelectedGenre}
          />
        </div>
      )}

      {/* 에피소드 그리드 */}
      {filteredEpisodes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEpisodes.map((episode) => (
            <EpisodeCard key={episode._id} episode={episode} />
          ))}
        </div>
      )}
    </>
  )
}
