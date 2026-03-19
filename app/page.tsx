/**
 * 홈 페이지
 * 폴카도트 한국어 단편 소설 웹앱의 메인 페이지
 */

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex max-w-md flex-col items-center text-center">
        {/* 로고/타이틀 */}
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          폴카도트
        </h1>
        
        {/* 영문 부제 */}
        <p className="mt-2 text-sm italic text-muted-foreground">
          Polkadot
        </p>
        
        {/* 설명 */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          몰입감 있는 한국어 단편 소설 리더 경험
        </p>

        {/* CTA 버튼 */}
        <Link
          href="/universe"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          이야기 시작하기
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
      </div>
    </main>
  )
}
