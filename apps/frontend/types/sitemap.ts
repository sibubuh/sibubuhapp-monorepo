export type SitemapProps = {
  title: string
  href: string
  items: {
    title: string
    href: string
  }[]
}

export type SitemapSectionProps = {
  sitemapList: SitemapProps[]
}
