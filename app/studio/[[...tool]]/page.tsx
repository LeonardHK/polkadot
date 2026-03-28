'use client'

/**
 * Sanity Studio 내장 페이지
 * /studio 경로에서 Sanity Studio에 접근할 수 있습니다.
 */

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
