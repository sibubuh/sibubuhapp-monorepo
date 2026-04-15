import { SeoData } from './seo'

export type News = {
  source: string
  image: string
  title: string
  slug: string
  date: number
  content: string
  seo?: SeoData
}

export type NewsResponse = Record<string, Record<string, News>>
