/**
 * 홈 페이지
 * 폴카도트 한국어 단편 소설 웹앱의 메인 랜딩
 *
 * [변경사항]
 * - 다크모드 자동 지원 (Tailwind class 기반)
 * - 미니멀한 문학적 분위기 강화
 * - 에피소드 수 동적 표시
 */

import Link from 'next/link'
import { getAllEpisodes } from '@/lib/sanity'

export default async function HomePage() {
  const episodes = await getAllEpisodes()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* 로고 */}
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          폴카도트
        </h1>

        {/* 영문 부제 */}
        <p className="mt-2 text-sm italic text-muted-foreground">
          Polkadot
        </p>

        {/* 구분선 */}
        <div className="mt-8 h-px w-12 bg-border" />

        {/* 설명 */}
        <p className="mt-8 font-serif text-lg leading-relaxed text-muted-foreground">
          한 편의 이야기가<br />당신을 기다립니다
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
          이야기 시작하기
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
