import { ImageType } from './image'
import { SeoData } from './seo'

/**
 * A blog story imported from the bubuh.id Blogger blog.
 *
 * `content` is raw HTML straight from Blogger — always sanitise it before
 * rendering (same DOMPurify path used by RawHtmlSection).
 */
export type Story = {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt?: string
  content: string
  contentText?: string
  thumbnail?: ImageType
  labels: string[]
  blogspotId: string
  blogspotUrl?: string
  blogspotPath?: string
  publishedDate: string
  updatedDate?: string
  commentCount: number
  author?: string
  seo?: SeoData
  createdAt: string
  updatedAt: string
  publishedAt: string
}
