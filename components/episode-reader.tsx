'use client'

/**
 * 에피소드 리더 컴포넌트
 * 가독성 최적화된 소설 리더
 *
 * [변경사항]
 * - 스크롤 기반 읽기로 전환 (페이지네이션 제거 — 단락 1개인 데이터에서 무의미)
 * - 본문 최대 너비 38em으로 제한 (가독성)
 * - 거대 단락을 마침표 기준으로 자동 분할
 * - 행간 2.05, 들여쓰기 1em, 양쪽 정렬
 * - 다크모드 토글, 작가의 말, 읽기 시간 유지
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Episode } from '@/lib/sanity'

interface EpisodeReaderProps {
  episode: Episode
  nextEpisode: Episode | null
}

/**
 * Sanity 데이터의 단락을 표시용 단락으로 변환
 * 1) 작가가 넣은 줄바꿈(\n)을 단락 구분으로 존중
 * 2) 줄바꿈 없는 긴 덩어리만 마침표 기준으로 보조 분할
 */
function splitIntoParagraphs(paragraphs: string[]): string[] {
  const result: string[] = []
  const TARGET_LENGTH = 300

  for (const p of paragraphs) {
    if (!p) continue

    // 줄바꿈으로 먼저 분리 (작가의 의도 존중)
    const lines = p.split(/\n/)

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue // 빈 줄은 건너뛰기 (단락 간격으로 표현됨)

      // 적절한 길이면 그대로
      if (trimmed.length <= TARGET_LENGTH) {
        result.push(trimmed)
        continue
      }

      // 긴 텍스트: 마침표 기준 보조 분할
      let remaining = trimmed
      let buffer = ''

      while (remaining.length > 0) {
        const sentenceEnd = remaining.search(/\.\s/)

        if (sentenceEnd === -1) {
          buffer += remaining
          remaining = ''
        } else {
          buffer += remaining.slice(0, sentenceEnd + 1)
          remaining = remaining.slice(sentenceEnd + 1).trimStart()
        }

        if (buffer.length >= TARGET_LENGTH && remaining.length > 0) {
          result.push(buffer.trim())
          buffer = ''
        }
      }

      if (buffer.trim()) {
        result.push(buffer.trim())
      }
    }
  }

  return result.length > 0 ? result : ['']
}

export default function EpisodeReader({ episode, nextEpisode }: EpisodeReaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // 읽기 시간 계산
  const readTime = episode.estimatedReadTime ||
    Math.max(1, Math.ceil((episode.paragraphs?.join('').length || 0) / 500))

  // 단락 분할 처리
  const displayParagraphs = useMemo(
    () => splitIntoParagraphs(episode.paragraphs || []),
    [episode.paragraphs]
  )

  // 스크롤 시 헤더 자동 숨김/표시
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const handleScroll = () => {
      const y = el.scrollTop
      if (y > lastScrollY.current && y > 80) {
        setShowHeader(false) // 아래로 스크롤 → 숨김
      } else {
        setShowHeader(true)  // 위로 스크롤 → 표시
      }
      lastScrollY.current = y
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // 읽기 진행률
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const updateProgress = () => {
      const scrollable = el.scrollHeight - el.clientHeight
      if (scrollable > 0) {
        setProgress((el.scrollTop / scrollable) * 100)
      }
    }

    el.addEventListener('scroll', updateProgress, { passive: true })
    return () => el.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="reader-container flex h-dvh flex-col overflow-hidden">
      {/* ── 상단 바 ── */}
      <header
        className="sticky top-0 z-10 flex-shrink-0 border-b transition-transform duration-300"
        style={{ transform: showHeader ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* 뒤로 가기 */}
          <Link
            href="/universe"
            className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--reader-muted)' }}
            aria-label="에피소드 목록으로 돌아가기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="sr-only sm:not-sr-only">목록</span>
          </Link>

          {/* 제목 */}
          <h1 className="flex-1 truncate text-center font-serif text-sm font-medium px-2">
            {episode.title}
          </h1>

          {/* 우측: 다크모드 토글 + 에피소드 번호 */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="transition-opacity hover:opacity-70"
                style={{ color: 'var(--reader-muted)' }}
                aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}
            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--reader-muted)' }}>
              EP.{episode.episodeNumber}
            </span>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="h-0.5 w-full" style={{ backgroundColor: 'var(--reader-border)' }}>
          <div
            className="progress-bar h-full"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`읽기 진행률: ${Math.round(progress)}%`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ── 스크롤 본문 ── */}
      <main
        ref={contentRef}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="reader-content px-5 sm:px-8 py-10 sm:py-14">
          {/* 에피소드 시작 표시 */}
          <div className="mb-10 sm:mb-14 text-center">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--reader-muted)' }}>
              EP.{episode.episodeNumber}
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-2">
              {episode.title}
            </h2>
            {episode.englishSubtitle && (
              <p className="text-sm italic" style={{ color: 'var(--reader-muted)' }}>
                {episode.englishSubtitle}
              </p>
            )}
            {episode.logline && (
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--reader-muted)' }}>
                {episode.logline}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--reader-muted)' }}>
              <span>약 {readTime}분</span>
              {episode.genre && <span>·</span>}
              {episode.genre && <span>{episode.genre}</span>}
            </div>
            {/* 구분선 */}
            <div className="mt-8 mx-auto w-12 border-t" style={{ borderColor: 'var(--reader-border)' }} />
          </div>

          {/* 본문 단락들 */}
          {displayParagraphs.map((paragraph, index) => (
            <p key={index} className="reader-paragraph">
              {paragraph}
            </p>
          ))}

          {/* 작가의 말 */}
          {episode.authorNote && (
            <div className="reader-author-note">
              <p className="mb-3 font-sans text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--reader-muted)' }}>
                작가의 말
              </p>
              <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', color: 'var(--reader-muted)' }}>
                {episode.authorNote}
              </p>
            </div>
          )}

          {/* 마지막: 다음 에피소드 / 목록 버튼 */}
          <div className="mt-16 flex flex-col items-center gap-5 border-t pt-10 pb-6" style={{ borderColor: 'var(--reader-border)' }}>
            {nextEpisode ? (
              <>
                <p className="text-sm" style={{ color: 'var(--reader-muted)' }}>
                  이야기가 계속됩니다
                </p>
                <Link
                  href={`/universe/${nextEpisode.slug.current}`}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--reader-text)',
                    color: 'var(--reader-bg)',
                  }}
                >
                  다음 에피소드
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
                <p className="text-center font-serif text-sm" style={{ color: 'var(--reader-muted)' }}>
                  EP.{nextEpisode.episodeNumber}: {nextEpisode.title}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: 'var(--reader-muted)' }}>
                  끝
                </p>
                <Link
                  href="/universe"
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--reader-text)',
                    color: 'var(--reader-bg)',
                  }}
                >
                  목록으로 돌아가기
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
