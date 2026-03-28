'use client'

/**
 * Sanity Studio 설정
 * Next.js 앱에 내장되어 /studio 경로에서 접근 가능
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import episode from './sanity/schemas/episode'

export default defineConfig({
  name: 'polkadot-studio',
  title: 'Polkadot — 작품 관리',

  projectId: 'vmpzfrqm',
  dataset: 'production',

  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id('root')
          .title('콘텐츠')
          .items([
            S.listItem()
              .id('episode')
              .title('에피소드')
              .schemaType('episode')
              .child(
                S.documentTypeList('episode')
                  .id('episodeList')
                  .title('에피소드 목록')
              ),
          ]),
    }),
    visionTool({
      defaultApiVersion: '2024-01-01',
      defaultDataset: 'production',
    }),
  ],

  schema: {
    types: [episode],
  },
})
