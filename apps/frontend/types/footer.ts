import { AnchorType, ImageType, TitleAnchorType, TitleContentType } from './index'

export type Footer = {
  id: number
  attributes: {
    copyright: string
    links: AnchorType[]
    address: TitleContentType
    contacts: TitleAnchorType[]
    logo: ImageType
  }
  locale: string
}
