import { ImageType } from './image'

export type SeoData = {
  id: number
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  metaImage?: ImageType
}
