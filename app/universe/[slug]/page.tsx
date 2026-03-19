/**
 * 에피소드 리더 페이지 (/universe/[slug])
 * 동적 라우팅으로 각 에피소드의 상세 페이지 표시
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getEpisodeBySlug, getNextEpisode, getAllEpisodeSlugs } from '@/lib/sanity'
import EpisodeReader from '@/components/episode-reader'

// 페이지 Props 타입 정의
interface EpisodePageProps {
  params: Promise<{
    slug: string
  }>
}

// 정적 경로 생성 (빌드 시 모든 에피소드 페이지 미리 생성)
export async function generateStaticParams() {
  const slugs = await getAllEpisodeSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params
  const episode = await getEpisodeBySlug(slug)

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
  
  // Sanity에서 에피소드 데이터 가져오기
  const episode = await getEpisodeBySlug(slug)

  // 에피소드가 없으면 404 페이지 표시
  if (!episode) {
    notFound()
  }

  // 다음 에피소드 정보 가져오기 (마지막 페이지 버튼용)
  const nextEpisode = await getNextEpisode(episode.episodeNumber)

  return <EpisodeReader episode={episode} nextEpisode={nextEpisode} />
}
