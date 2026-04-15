import type { Analytics, Footer, Navbar, SeoData, ShareButton } from './index'

export type Page = {
  id: number
  title: string
  slug: string
  sections: SectionItem[]
  seo?: SeoData
  createdAt: string
  updatedAt: string
}

export type SectionItem = {
  id: number
  __component: string
  [key: string]: unknown
}

export type FullPage<T> = {
  data: T
  header: Navbar | null
  footer: Footer | null
  analytic: Analytics | null
  shareButton?: ShareButton | null
}
