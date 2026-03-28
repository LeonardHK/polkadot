/**
 * 사이트 설정 스키마 (싱글톤)
 * Studio에서 사이트 전역 텍스트를 관리합니다.
 */

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: '사이트 설정',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: '사이트 이름',
      type: 'string',
      description: '헤더와 메타태그에 표시 (예: 폴카도트)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteSubtitle',
      title: '부제',
      type: 'string',
      description: '사이트 이름 아래 표시 (예: 한국어 단편 소설)',
    }),
    defineField({
      name: 'heroText',
      title: '홈 문구',
      type: 'text',
      description: '홈 페이지 중앙 문구 (예: 한 편의 이야기가 당신을 기다립니다)',
      rows: 2,
    }),
    defineField({
      name: 'ctaText',
      title: '시작 버튼 텍스트',
      type: 'string',
      description: '홈 페이지 버튼 (예: 이야기 시작하기)',
    }),
    defineField({
      name: 'collectionTitle',
      title: '작품 목록 이름',
      type: 'string',
      description: '에피소드 목록 페이지 제목 (예: 유니버스, 작품집, 이야기)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'collectionDescription',
      title: '작품 목록 설명',
      type: 'string',
      description: '에피소드 목록 페이지 부제',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: '사이트 설정',
      }
    },
  },
})
