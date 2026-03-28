/**
 * Sanity CMS 클라이언트 설정
 * 한국어 단편 소설 웹앱을 위한 Sanity 연결 설정
 *
 * [변경사항]
 * - Episode 인터페이스 확장: genre, tags, coverImage, authorNote, estimatedReadTime
 * - 쿼리 최적화: 목록용/상세용 쿼리 분리
 * - 장르별 필터 쿼리 추가
 * - 이미지 URL 헬퍼 추가
 */

import { createClient } from '@sanity/client'

// Sanity 클라이언트 인스턴스 생성
export const sanityClient = createClient({
  projectId: 'vmpzfrqm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // 콘텐츠 변경 즉시 반영을 위해 CDN 캐시 비활성화
})

// ── 타입 정의 ──

// 장르 enum (Sanity 스키마의 list options와 일치시킬 것)
export type Genre =
  | 'literary'    // 순문학
  | 'thriller'    // 스릴러
  | 'romance'     // 로맨스
  | 'sf'          // SF
  | 'fantasy'     // 판타지
  | 'horror'      // 호러
  | 'satire'      // 풍자
  | 'mystery'     // 미스터리
  | 'historical'  // 역사
  | 'other'       // 기타

// 장르 한국어 라벨
export const genreLabels: Record<Genre, string> = {
  literary: '순문학',
  thriller: '스릴러',
  romance: '로맨스',
  sf: 'SF',
  fantasy: '판타지',
  horror: '호러',
  satire: '풍자',
  mystery: '미스터리',
  historical: '역사',
  other: '기타',
}

// Sanity 이미지 참조 타입
export interface SanityImageRef {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

// 에피소드 문서 타입 정의 (확장)
export interface Episode {
  _id: string
  title: string
  englishSubtitle?: string
  episodeNumber: number
  logline?: string
  slug: {
    current: string
  }
  paragraphs: string[]
  published: boolean
  publishedAt?: string

  // ── 확장 필드 (없어도 안전하게 동작) ──
  genre?: Genre
  tags?: string[]
  coverImage?: SanityImageRef
  authorNote?: string           // 작가의 말 (에피소드 말미에 표시)
  estimatedReadTime?: number    // 예상 읽기 시간 (분)
}

// ── 이미지 URL 헬퍼 ──

/**
 * Sanity 이미지 참조에서 CDN URL 생성
 * @example imageUrl(episode.coverImage, 800, 600)
 */
export function imageUrl(
  image: SanityImageRef | undefined | null,
  width?: number,
  height?: number
): string | null {
  if (!image?.asset?._ref) return null

  // _ref 형식: image-{id}-{width}x{height}-{format}
  const ref = image.asset._ref
  const [, id, dimensions, format] = ref.split('-')
  if (!id || !dimensions || !format) return null

  let url = `https://cdn.sanity.io/images/vmpzfrqm/production/${id}-${dimensions}.${format}`
  const params: string[] = []
  if (width) params.push(`w=${width}`)
  if (height) params.push(`h=${height}`)
  params.push('fit=crop')
  params.push('auto=format')

  if (params.length > 0) {
    url += '?' + params.join('&')
  }

  return url
}

// 사이트 설정 타입
export interface SiteSettings {
  siteTitle: string
  siteSubtitle?: string
  heroText?: string
  ctaText?: string
  collectionTitle: string
  collectionDescription?: string
}

// 기본값 (설정 문서가 아직 없을 때)
export const defaultSettings: SiteSettings = {
  siteTitle: '폴카도트',
  siteSubtitle: '한국어 단편 소설',
  heroText: '한 편의 이야기가 당신을 기다립니다',
  ctaText: '이야기 시작하기',
  collectionTitle: '유니버스',
  collectionDescription: '',
}

// ── 데이터 페칭 함수 ──

/**
 * 사이트 설정 조회 (싱글톤)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const query = `*[_type == "siteSettings" && _id == "siteSettings"][0] {
    siteTitle,
    siteSubtitle,
    heroText,
    ctaText,
    collectionTitle,
    collectionDescription
  }`
  const result = await sanityClient.fetch(query)
  return result || defaultSettings
}

/**
 * 모든 공개된 에피소드 목록 (허브 페이지용)
 * paragraphs 본문은 가져오지 않음 → 가벼운 목록 쿼리
 */
export async function getAllEpisodes(): Promise<Episode[]> {
  const query = `*[_type == "episode" && published == true] | order(episodeNumber asc) {
    _id,
    title,
    englishSubtitle,
    episodeNumber,
    logline,
    slug,
    publishedAt,
    genre,
    tags,
    coverImage,
    estimatedReadTime,
    "paragraphCount": count(paragraphs)
  }`

  return sanityClient.fetch(query)
}

/**
 * 장르별 에피소드 필터
 */
export async function getEpisodesByGenre(genre: Genre): Promise<Episode[]> {
  const query = `*[_type == "episode" && published == true && genre == $genre] | order(episodeNumber asc) {
    _id,
    title,
    englishSubtitle,
    episodeNumber,
    logline,
    slug,
    publishedAt,
    genre,
    tags,
    coverImage,
    estimatedReadTime,
    "paragraphCount": count(paragraphs)
  }`

  return sanityClient.fetch(query, { genre })
}

/**
 * 사용 중인 장르 목록 (필터 UI용)
 */
export async function getAvailableGenres(): Promise<Genre[]> {
  const query = `array::unique(*[_type == "episode" && published == true && defined(genre)].genre)`
  return sanityClient.fetch(query)
}

/**
 * 특정 슬러그로 에피소드 상세 정보 (리더 페이지용)
 * paragraphs 본문 포함
 */
export async function getEpisodeBySlug(slug: string): Promise<Episode | null> {
  const query = `*[_type == "episode" && slug.current == $slug][0] {
    _id,
    title,
    englishSubtitle,
    episodeNumber,
    logline,
    slug,
    paragraphs,
    published,
    publishedAt,
    genre,
    tags,
    coverImage,
    authorNote,
    estimatedReadTime
  }`

  return sanityClient.fetch(query, { slug })
}

/**
 * 다음 에피소드 정보 (리더 페이지 하단 버튼용)
 */
export async function getNextEpisode(currentEpisodeNumber: number): Promise<Episode | null> {
  const query = `*[_type == "episode" && published == true && episodeNumber > $currentNumber] | order(episodeNumber asc)[0] {
    _id,
    title,
    episodeNumber,
    slug
  }`

  return sanityClient.fetch(query, { currentNumber: currentEpisodeNumber })
}

/**
 * 이전 에피소드 정보 (리더 페이지 네비게이션용)
 */
export async function getPrevEpisode(currentEpisodeNumber: number): Promise<Episode | null> {
  const query = `*[_type == "episode" && published == true && episodeNumber < $currentNumber] | order(episodeNumber desc)[0] {
    _id,
    title,
    episodeNumber,
    slug
  }`

  return sanityClient.fetch(query, { currentNumber: currentEpisodeNumber })
}

/**
 * 모든 에피소드의 슬러그 목록 (정적 경로 생성용)
 */
export async function getAllEpisodeSlugs(): Promise<string[]> {
  const query = `*[_type == "episode" && published == true].slug.current`
  return sanityClient.fetch(query)
}
