'use client'

/**
 * 에피소드 리더 컴포넌트
 * 모바일 최적화된 페이지네이션 기반 소설 리더
 * - 뷰포트 높이 기반 페이지 분할
 * - 좌우 스와이프 제스처 지원
 * - 읽기 진행률 표시
 */

import { useState, useRef, useEffect, useCallback, TouchEvent } from 'react'
import Link from 'next/link'
import { Episode } from '@/lib/sanity'

// 컴포넌트 Props 타입 정의
interface EpisodeReaderProps {
  episode: Episode
  nextEpisode: Episode | null
}

export default function EpisodeReader({ episode, nextEpisode }: EpisodeReaderProps) {
  // 현재 페이지 인덱스 (0부터 시작)
  const [currentPage, setCurrentPage] = useState(0)
  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1)
  // 터치 시작 위치 (스와이프 감지용)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  // 현재 터치 위치
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  // 스와이프 중 오프셋 (애니메이션용)
  const [swipeOffset, setSwipeOffset] = useState(0)
  // 페이지네이션 계산 완료 여부
  const [isReady, setIsReady] = useState(false)

  // 전체 콘텐츠를 담는 숨겨진 컨테이너 ref
  const contentRef = useRef<HTMLDivElement>(null)
  // 뷰포트 컨테이너 ref
  const viewportRef = useRef<HTMLDivElement>(null)

  // 스와이프 감지를 위한 최소 이동 거리 (px)
  const minSwipeDistance = 50

  // 페이지네이션 계산 함수
  // 전체 콘텐츠 높이를 뷰포트 높이로 나누어 페이지 수 계산
  const calculatePages = useCallback(() => {
    if (!contentRef.current || !viewportRef.current) return

    // 뷰포트 높이 계산 (상단바 56px + 하단 네비 64px 제외)
    const viewportHeight = viewportRef.current.clientHeight
    // 전체 콘텐츠 높이
    const contentHeight = contentRef.current.scrollHeight

    // 페이지 수 계산 (최소 1페이지)
    const pages = Math.ceil(contentHeight / viewportHeight)
    setTotalPages(Math.max(1, pages))
    setIsReady(true)
  }, [])

  // 컴포넌트 마운트 및 리사이즈 시 페이지 재계산
  useEffect(() => {
    // 초기 계산 (폰트 로딩 대기)
    const timer = setTimeout(calculatePages, 100)

    // 윈도우 리사이즈 시 재계산
    const handleResize = () => {
      setCurrentPage(0)
      calculatePages()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [calculatePages])

  // 이전 페이지로 이동
  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }, [])

  // 다음 페이지로 이동
  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }, [totalPages])

  // 터치 시작 핸들러
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  // 터치 이동 핸들러 (스와이프 미리보기 효과)
  const handleTouchMove = (e: TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)

    if (touchStart !== null) {
      const diff = touchStart - currentTouch
      // 스와이프 방향에 따라 제한적인 오프셋 적용
      // 첫 페이지에서 오른쪽 스와이프, 마지막 페이지에서 왼쪽 스와이프 제한
      if ((currentPage === 0 && diff < 0) || (currentPage === totalPages - 1 && diff > 0)) {
        setSwipeOffset(-diff * 0.3) // 저항감 있는 스와이프
      } else {
        setSwipeOffset(-diff * 0.5) // 부드러운 스와이프 미리보기
      }
    }
  }

  // 터치 종료 핸들러
  const handleTouchEnd = () => {
    setSwipeOffset(0) // 오프셋 초기화

    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    // 왼쪽 스와이프 = 다음 페이지
    if (isLeftSwipe) {
      goToNextPage()
    }
    // 오른쪽 스와이프 = 이전 페이지
    if (isRightSwipe) {
      goToPrevPage()
    }
  }

  // 키보드 네비게이션 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevPage()
      } else if (e.key === 'ArrowRight') {
        goToNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevPage, goToNextPage])

  // 뷰포트 높이 계산 (상단바 + 하단 네비 제외)
  const getViewportHeight = () => {
    if (!viewportRef.current) return 0
    return viewportRef.current.clientHeight
  }

  // 현재 페이지의 translateY 값 계산
  const getTranslateY = () => {
    return -(currentPage * getViewportHeight())
  }

  // 읽기 진행률 (백분율)
  const progressPercentage = totalPages > 1 ? ((currentPage + 1) / totalPages) * 100 : 100

  // 마지막 페이지 여부
  const isLastPage = currentPage === totalPages - 1

  return (
    <div className="reader-container flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: '#faf9f6', color: '#1a1a1a' }}>
      {/* 상단 고정 바: 에피소드 제목 + 진행률 바 */}
      <header className="sticky top-0 z-10 flex-shrink-0 border-b bg-[#faf9f6]" style={{ borderColor: '#e5e5e5' }}>
        {/* 제목 영역 */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* 뒤로 가기 버튼 */}
          <Link
            href="/universe"
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: '#666666' }}
            aria-label="에피소드 목록으로 돌아가기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="sr-only sm:not-sr-only">목록</span>
          </Link>

          {/* 에피소드 제목 */}
          <h1 className="flex-1 truncate text-center font-serif text-sm font-medium px-2">
            {episode.title}
          </h1>

          {/* 에피소드 번호 */}
          <span className="text-xs whitespace-nowrap" style={{ color: '#666666' }}>
            EP.{episode.episodeNumber}
          </span>
        </div>

        {/* 진행률 바 */}
        <div className="h-0.5 w-full" style={{ backgroundColor: '#e5e5e5' }}>
          <div
            className="progress-bar h-full"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: '#1a1a1a',
            }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`읽기 진행률: ${Math.round(progressPercentage)}%`}
          />
        </div>
      </header>

      {/* 본문 뷰포트 영역 */}
      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 로딩 상태 */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm" style={{ color: '#666666' }}>
              로딩 중...
            </div>
          </div>
        )}

        {/* 페이지네이션되는 콘텐츠 컨테이너 */}
        <div
          ref={contentRef}
          className={`page-transition ${isReady ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `translateY(${getTranslateY() + swipeOffset}px)`,
            padding: '24px',
          }}
        >
          {/* 본문 단락들 */}
          {episode.paragraphs?.map((paragraph, index) => (
            <p
              key={index}
              className="mb-6 font-serif text-base leading-[1.9]"
              style={{
                textAlign: 'justify',
                wordBreak: 'keep-all',
              }}
            >
              {paragraph}
            </p>
          ))}

          {/* 마지막 페이지에 다음 에피소드 버튼 표시 */}
          {isLastPage && nextEpisode && (
            <div className="mt-12 flex flex-col items-center gap-4 border-t pt-8" style={{ borderColor: '#e5e5e5' }}>
              <p className="text-sm" style={{ color: '#666666' }}>
                이야기가 계속됩니다
              </p>
              <Link
                href={`/universe/${nextEpisode.slug.current}`}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#faf9f6',
                }}
              >
                다음 에피소드
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
              <p className="text-center font-serif text-sm" style={{ color: '#666666' }}>
                EP.{nextEpisode.episodeNumber}: {nextEpisode.title}
              </p>
            </div>
          )}

          {/* 마지막 페이지이고 다음 에피소드가 없는 경우 */}
          {isLastPage && !nextEpisode && (
            <div className="mt-12 flex flex-col items-center gap-4 border-t pt-8" style={{ borderColor: '#e5e5e5' }}>
              <p className="text-sm" style={{ color: '#666666' }}>
                시리즈의 마지막 에피소드입니다
              </p>
              <Link
                href="/universe"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#faf9f6',
                }}
              >
                목록으로 돌아가기
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 네비게이션 */}
      <nav
        className="sticky bottom-0 z-10 flex-shrink-0 border-t bg-[#faf9f6]"
        style={{ borderColor: '#e5e5e5' }}
        aria-label="페이지 네비게이션"
      >
        <div className="flex items-center justify-between px-4 py-4">
          {/* 이전 페이지 버튼 */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-1 text-sm font-medium transition-colors disabled:opacity-30"
            style={{ color: currentPage === 0 ? '#999999' : '#1a1a1a' }}
            aria-label="이전 페이지"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            이전
          </button>

          {/* 현재 페이지 / 전체 페이지 표시 */}
          <span className="text-sm" style={{ color: '#666666' }}>
            {currentPage + 1} / {totalPages}
          </span>

          {/* 다음 페이지 버튼 */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-1 text-sm font-medium transition-colors disabled:opacity-30"
            style={{ color: currentPage === totalPages - 1 ? '#999999' : '#1a1a1a' }}
            aria-label="다음 페이지"
          >
            다음
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  )
}
