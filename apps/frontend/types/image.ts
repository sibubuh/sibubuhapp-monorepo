/** One of the resized variants Strapi generates on upload. */
export type ImageFormat = {
  url: string
  width: number
  height: number
  mime?: string
  size?: number
}

export type ImageType = {
  id: number
  url: string
  size: number
  width: number
  height: number
  name: string
  /** thumbnail/small/medium/large, present only when the source was larger. */
  formats?: Partial<Record<'thumbnail' | 'small' | 'medium' | 'large', ImageFormat>>
}
