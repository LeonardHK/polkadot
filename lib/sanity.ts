/**
 * Sanity CMS 클라이언트 설정
 * 한국어 단편 소설 웹앱을 위한 Sanity 연결 설정
 */

import { createClient } from '@sanity/client'

// Sanity 클라이언트 인스턴스 생성
// projectId와 dataset은 Sanity 프로젝트 설정에서 가져옴
export const sanityClient = createClient({
  projectId: 'vmpzfrqm', // Sanity 프로젝트 ID
  dataset: 'production', // 데이터셋 이름
  apiVersion: '2024-01-01', // API 버전 (날짜 형식)
  useCdn: true, // CDN 사용으로 빠른 응답 (프로덕션에서 권장)
})

// 에피소드 문서 타입 정의
export interface Episode {
  _id: string
  title: string // 한국어 제목
  englishSubtitle: string // 영어 부제목
  episodeNumber: number // 에피소드 번호
  logline: string // 줄거리 요약
  slug: {
    current: string
  }
  paragraphs: string[] // 본문 단락 배열 (각 항목이 하나의 단락)
  published: boolean // 공개 여부
  publishedAt: string // 공개 일시
}

// 모든 공개된 에피소드 목록 가져오기 (허브 페이지용)
export async function getAllEpisodes(): Promise<Episode[]> {
  // GROQ 쿼리: 공개된 에피소드만 가져오고, 에피소드 번호 순으로 정렬
  const query = `*[_type == "episode" && published == true] | order(episodeNumber asc) {
    _id,
    title,
    englishSubtitle,
    episodeNumber,
    logline,
    slug,
    publishedAt
  }`
  
  return sanityClient.fetch(query)
}

// 특정 슬러그로 에피소드 상세 정보 가져오기 (리더 페이지용)
export async function getEpisodeBySlug(slug: string): Promise<Episode | null> {
  // GROQ 쿼리: 슬러그가 일치하는 에피소드의 전체 정보 가져오기
  const query = `*[_type == "episode" && slug.current == $slug][0] {
    _id,
    title,
    englishSubtitle,
    episodeNumber,
    logline,
    slug,
    paragraphs,
    published,
    publishedAt
  }`
  
  return sanityClient.fetch(query, { slug })
}

// 다음 에피소드 정보 가져오기 (리더 페이지 하단 버튼용)
export async function getNextEpisode(currentEpisodeNumber: number): Promise<Episode | null> {
  // GROQ 쿼리: 현재 에피소드 번호보다 큰 번호 중 가장 작은 에피소드 가져오기
  const query = `*[_type == "episode" && published == true && episodeNumber > $currentNumber] | order(episodeNumber asc)[0] {
    _id,
    title,
    episodeNumber,
    slug
  }`
  
  return sanityClient.fetch(query, { currentNumber: currentEpisodeNumber })
}

// 모든 에피소드의 슬러그 목록 가져오기 (정적 경로 생성용)
export async function getAllEpisodeSlugs(): Promise<string[]> {
  const query = `*[_type == "episode" && published == true].slug.current`
  return sanityClient.fetch(query)
}
