import { BlocksContent } from '@strapi/blocks-react-renderer'

import { ImageType } from './image'
import { SeoData } from './seo'

export type Post = {
  createdAt: string
  date: string
  id: number
  locale: 'en'
  slug: string
  title: string
  thumbnail: ImageType
  localizations: Post[]
  source: string
  content: BlocksContent
  seo?: SeoData
}
