export const SITE_NAME = 'A Sibubuh Playground Portfolio'

/**
 * Absolute origin used for canonical URLs, Open Graph and JSON-LD.
 * Must be the public origin — a relative or localhost value makes Google
 * discard the canonical and makes og:image unfetchable by scrapers.
 */
export const SITE_URL = (
	import.meta.env.VITE_PUBLIC_SITE_URL || 'https://porto.bubuh.id'
).replace(/\/+$/, '')

export const SITE_DESCRIPTION =
	'Sibubuh Playground is the personal portfolio and blog of Sibubuh — web development, mobile apps, UI/UX design and KOL work, plus stories from the bubuh.id blog.'

export const SITE_AUTHOR = 'Sibubuh'

export const SITE_EMAIL = 'nchan.bkho@gmail.com'

/**
 * Optional 1200x630 raster image for Open Graph / Twitter cards.
 * Left empty on purpose: pointing og:image at a missing or SVG asset is worse
 * than omitting the tag, since most scrapers reject both.
 */
export const DEFAULT_OG_IMAGE = import.meta.env.VITE_PUBLIC_OG_IMAGE || ''

export const DEFAULT_LANGUAGE_CODE = 'en'
