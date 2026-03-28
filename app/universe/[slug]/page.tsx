/**
 * 에피소드 리더 페이지 (/universe/[slug])
 * 동적 라우팅으로 각 에피소드의 상세 페이지 표시
 *
 * [변경사항]
 * - dynamicParams: true 추가 (빌드 시 생성되지 않은 경로도 런타임에 생성)
 * - slug 디코딩 처리 (한글 슬러그 호환)
 * - getPrevEpisode 추가 (향후 네비게이션 확장용)
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getEpisodeBySlug, getNextEpisode, getAllEpisodeSlugs } from '@/lib/sanity'
import EpisodeReader from '@/components/episode-reader'

// 빌드 시 생성되지 않은 slug도 런타임에 처리
export const dynamicParams = true

// 페이지 Props 타입 정의
interface EpisodePageProps {
  params: Promise<{
    slug: string
  }>
}

// 정적 경로 생성
export async function generateStaticParams() {
  const slugs = await getAllEpisodeSlugs()
  return slugs.map((slug) => ({
    slug: encodeURIComponent(slug),
  }))
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const episode = await getEpisodeBySlug(decodedSlug)

  if (!episode) {
    return {
      title: '에피소드를 찾을 수 없습니다',
    }
  }

  return {
    title: `${episode.title} | 폴카도트`,
    description: episode.logline || `에피소드 ${episode.episodeNumber}: ${episode.title}`,
    openGraph: {
      title: episode.title,
      description: episode.logline || `에피소드 ${episode.episodeNumber}`,
      type: 'article',
    },
  }
}

// 메인 페이지 컴포넌트
export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  // Sanity에서 에피소드 데이터 가져오기
  const episode = await getEpisodeBySlug(decodedSlug)

  if (!episode) {
    notFound()
  }

  // 다음 에피소드 정보 가져오기
  const nextEpisode = await getNextEpisode(episode.episodeNumber)

  return <EpisodeReader episode={episode} nextEpisode={nextEpisode} />
}
