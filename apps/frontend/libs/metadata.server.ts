import { SITE_NAME, SITE_URL } from '../config/metadata'

export function generateGenericMetadata(t: any, imagePath: string) {
  const title = `${t('hero.title')} - ${SITE_NAME}`
  const description = t('hero.subtitle')

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      image: imagePath,
    },
    url: SITE_URL,
  }
}
