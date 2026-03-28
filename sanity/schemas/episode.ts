/**
 * Sanity Studio 스키마: episode
 *
 * 이 파일은 Sanity Studio 프로젝트의 schemas/ 폴더에 넣어 사용합니다.
 * 기존 episode 스키마를 확장하여 단편 모음 구조에 맞는 필드를 추가했습니다.
 *
 * [기존 필드] title, englishSubtitle, episodeNumber, logline, slug, paragraphs, published, publishedAt
 * [추가 필드] genre, tags, coverImage, authorNote, estimatedReadTime
 *
 * 추가 필드는 모두 optional이므로 기존 데이터와 호환됩니다.
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'episode',
  title: '에피소드',
  type: 'document',
  fields: [
    // ── 기본 정보 ──
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      description: '한국어 제목',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'englishSubtitle',
      title: '영문 부제',
      type: 'string',
      description: '영어 부제목 (선택)',
    }),
    defineField({
      name: 'slug',
      title: '슬러그',
      type: 'slug',
      description: 'URL에 사용되는 고유 식별자',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'episodeNumber',
      title: '에피소드 번호',
      type: 'number',
      description: '정렬에 사용되는 번호',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'logline',
      title: '로그라인',
      type: 'text',
      description: '한 줄 줄거리 요약',
      rows: 2,
    }),

    // ── 분류 (추가) ──
    defineField({
      name: 'genre',
      title: '장르',
      type: 'string',
      options: {
        list: [
          { title: '순문학', value: 'literary' },
          { title: '스릴러', value: 'thriller' },
          { title: '로맨스', value: 'romance' },
          { title: 'SF', value: 'sf' },
          { title: '판타지', value: 'fantasy' },
          { title: '호러', value: 'horror' },
          { title: '풍자', value: 'satire' },
          { title: '미스터리', value: 'mystery' },
          { title: '역사', value: 'historical' },
          { title: '기타', value: 'other' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'tags',
      title: '태그',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: '검색 및 분류용 태그 (예: 방글라데시, 무협, 바퀴벌레)',
    }),

    // ── 비주얼 (추가) ──
    defineField({
      name: 'coverImage',
      title: '커버 이미지',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: '에피소드 카드에 표시되는 대표 이미지 (선택)',
    }),

    // ── 본문 ──
    defineField({
      name: 'paragraphs',
      title: '본문',
      type: 'array',
      of: [{ type: 'text' }],
      description: '각 항목이 하나의 단락. 리더에서 단락 단위로 표시됩니다.',
    }),

    // ── 부가 정보 (추가) ──
    defineField({
      name: 'authorNote',
      title: '작가의 말',
      type: 'text',
      description: '에피소드 말미에 표시되는 후기 (선택)',
      rows: 4,
    }),
    defineField({
      name: 'estimatedReadTime',
      title: '예상 읽기 시간',
      type: 'number',
      description: '분 단위. 비워두면 글자 수 기준 자동 계산됩니다.',
    }),

    // ── 공개 설정 ──
    defineField({
      name: 'published',
      title: '공개 여부',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: '공개일',
      type: 'datetime',
    }),
  ],

  // Studio 미리보기 설정
  preview: {
    select: {
      title: 'title',
      subtitle: 'englishSubtitle',
      episodeNumber: 'episodeNumber',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, subtitle, episodeNumber, media } = selection
      return {
        title: `EP.${episodeNumber || '?'} ${title || '제목 없음'}`,
        subtitle: subtitle || '',
        media,
      }
    },
  },

  // 정렬 기본값
  orderings: [
    {
      title: '에피소드 번호순',
      name: 'episodeNumberAsc',
      by: [{ field: 'episodeNumber', direction: 'asc' }],
    },
    {
      title: '최신 공개순',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
