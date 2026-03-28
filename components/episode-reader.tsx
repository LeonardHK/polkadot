'use client'

/**
 * 에피소드 리더 컴포넌트
 * 모바일 최적화된 페이지네이션 기반 소설 리더
 *
 * [변경사항]
 * - 다크모드 지원: CSS 변수 기반 (하드코딩된 색상 제거)
 * - 단락 단위 페이지네이션: 단락이 페이지 경계에서 잘리지 않도록 보장
 * - 작가의 말 (authorNote) 표시
 * - 읽기 시간 표시
 * - 다크모드 토글 버튼 추가
 * - 탭(화면 좌/우 영역) 탭으로도 페이지 이동
 */

import { useState, useRef, useEffect, useCallback, TouchEvent, MouseEvent } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Episode } from '@/lib/sanity'

interface EpisodeReaderProps {
  episode: Episode
  nextEpisode: Episode | null
}

export default function EpisodeReader({ episode, nextEpisode }: EpisodeReaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState<number[][]>([]) // 각 페이지에 포함된 단락 인덱스 배열
  const [isReady, setIsReady] = useState(false)

  // 터치/스와이프 상태
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // refs
  const viewportRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  // 하이드레이션 후 마운트 표시
  useEffect(() => setMounted(true), [])

  // 읽기 시간 계산
  const readTime = episode.estimatedReadTime ||
    Math.max(1, Math.ceil((episode.paragraphs?.join('').length || 0) / 500))

  // ── 단락 단위 페이지네이션 ──
  // 각 단락의 높이를 측정하여, 뷰포트에 들어가는 단락들을 그룹핑
  const calculatePages = useCallback(() => {
    if (!measureRef.current || !viewportRef.current) return
    if (!episode.paragraphs || episode.paragraphs.length === 0) {
      setPages([[]])
      setIsReady(true)
      return
    }

    const viewportHeight = viewportRef.current.clientHeight
    const paragraphEls = measureRef.current.querySelectorAll('[data-paragraph]')

    const newPages: number[][] = []
    let currentPageParagraphs: number[] = []
    let currentHeight = 0

    paragraphEls.forEach((el, index) => {
      const elHeight = el.getBoundingClientRect().height
      const gap = 24 // paragraph gap (mb-6 ≈ 24px)

      // 첫 단락이면 gap 없이 높이만
      const addedHeight = currentPageParagraphs.length === 0 ? elHeight : elHeight + gap

      if (currentHeight + addedHeight > viewportHeight && currentPageParagraphs.length > 0) {
        // 현재 페이지 마감하고 새 페이지 시작
        newPages.push(currentPageParagraphs)
        currentPageParagraphs = [index]
        currentHeight = elHeight
      } else {
        currentPageParagraphs.push(index)
        currentHeight += addedHeight
      }
    })

    // 마지막 페이지 추가
    if (currentPageParagraphs.length > 0) {
      newPages.push(currentPageParagraphs)
    }

    // 작가의 말이 있으면 마지막 페이지에 포함될 여유가 있는지 확인
    // (복잡해지므로 마지막 페이지에 그대로 포함)

    setPages(newPages.length > 0 ? newPages : [[]])
    setIsReady(true)
  }, [episode.paragraphs])

  useEffect(() => {
    // 폰트 로딩 대기 후 계산
    const timer = setTimeout(calculatePages, 200)

    const handleResize = () => {
      setCurrentPage(0)
      setIsReady(false)
      setTimeout(calculatePages, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [calculatePages])

  const totalPages = pages.length
  const isLastPage = currentPage === totalPages - 1

  // ── 네비게이션 ──
  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }, [totalPages])

  // 화면 탭으로 페이지 이동 (좌측 1/3 = 이전, 우측 2/3 = 다음)
  const handleTapNavigation = (e: MouseEvent<HTMLDivElement>) => {
    // 스와이프 중이면 무시
    if (touchStart !== null) return
    // 링크나 버튼 클릭은 무시
    const target = e.target as HTMLElement
    if (target.closest('a, button')) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    if (x < width * 0.33) {
      goToPrevPage()
    } else {
      goToNextPage()
    }
  }

  // 터치 핸들러
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTouchStart(null)
      return
    }

    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) {
      goToNextPage()
    } else if (distance < -minSwipeDistance) {
      goToPrevPage()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevPage()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        goToNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevPage, goToNextPage])

  // 현재 페이지의 단락 인덱스들
  const currentParagraphs = pages[currentPage] || []

  // 진행률
  const progressPercentage = totalPages > 1 ? ((currentPage + 1) / totalPages) * 100 : 100

  return (
    <div className="reader-container flex h-dvh flex-col overflow-hidden">
      {/* ── 상단 바 ── */}
      <header className="sticky top-0 z-10 flex-shrink-0 border-b">
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
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`읽기 진행률: ${Math.round(progressPercentage)}%`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* ── 측정용 숨겨진 컨테이너 (페이지네이션 계산에만 사용) ── */}
      <div
        ref={measureRef}
        className="absolute left-0 top-0 -z-50 opacity-0 pointer-events-none"
        style={{
          width: viewportRef.current?.clientWidth || '100%',
          padding: '24px',
        }}
        aria-hidden="true"
      >
        {episode.paragraphs?.map((paragraph, index) => (
          <p key={index} data-paragraph className="reader-paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      {/* ── 본문 뷰포트 ── */}
      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTapNavigation}
      >
        {/* 로딩 */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm" style={{ color: 'var(--reader-muted)' }}>
              로딩 중...
            </div>
          </div>
        )}

        {/* 현재 페이지의 단락들 */}
        <div
          className={`h-full p-6 transition-opacity duration-200 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        >
          {currentParagraphs.map((paragraphIndex) => (
            <p key={paragraphIndex} className="reader-paragraph">
              {episode.paragraphs?.[paragraphIndex]}
            </p>
          ))}

          {/* 마지막 페이지: 작가의 말 */}
          {isLastPage && episode.authorNote && (
            <div className="reader-author-note">
              <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--reader-muted)' }}>
                작가의 말
              </p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{episode.authorNote}</p>
            </div>
          )}

          {/* 마지막 페이지: 다음 에피소드 / 목록 버튼 */}
          {isLastPage && (
            <div className="mt-12 flex flex-col items-center gap-4 border-t pt-8" style={{ borderColor: 'var(--reader-border)' }}>
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
                    시리즈의 마지막 에피소드입니다
                  </p>
                  <Link
                    href="/universe"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-opacity hover:opacity-80"
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
          )}
        </div>
      </div>

      {/* ── 하단 네비게이션 ── */}
      <nav
        className="sticky bottom-0 z-10 flex-shrink-0 border-t"
        aria-label="페이지 네비게이션"
      >
        <div className="flex items-center justify-between px-4 py-4">
          {/* 이전 */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-1 text-sm font-medium transition-opacity disabled:opacity-20"
            style={{ color: 'var(--reader-text)' }}
            aria-label="이전 페이지"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            이전
          </button>

          {/* 페이지 / 읽기 시간 */}
          <div className="flex flex-col items-center">
            <span className="text-sm" style={{ color: 'var(--reader-muted)' }}>
              {currentPage + 1} / {totalPages}
            </span>
            {currentPage === 0 && (
              <span className="text-xs" style={{ color: 'var(--reader-muted)', opacity: 0.7 }}>
                약 {readTime}분
              </span>
            )}
          </div>

          {/* 다음 */}
          <button
            onClick={goToNextPage}
            disabled={isLastPage}
            className="flex items-center gap-1 text-sm font-medium transition-opacity disabled:opacity-20"
            style={{ color: 'var(--reader-text)' }}
            aria-label="다음 페이지"
          >
            다음
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  )
}
