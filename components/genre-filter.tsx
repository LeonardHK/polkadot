'use client'

/**
 * 장르 필터 컴포넌트
 * 에피소드 허브 페이지에서 장르별 필터링
 */

import { Genre, genreLabels } from '@/lib/sanity'

interface GenreFilterProps {
  genres: Genre[]
  selected: Genre | null
  onSelect: (genre: Genre | null) => void
}

export default function GenreFilter({ genres, selected, onSelect }: GenreFilterProps) {
  if (genres.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 보기 */}
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          selected === null
            ? 'bg-foreground text-background'
            : 'bg-secondary text-muted-foreground hover:text-foreground'
        }`}
      >
        전체
      </button>
      {/* 장르 버튼들 */}
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelect(genre === selected ? null : genre)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            selected === genre
              ? 'bg-foreground text-background'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          {genreLabels[genre] || genre}
        </button>
      ))}
    </div>
  )
}
