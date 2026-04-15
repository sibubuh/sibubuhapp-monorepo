import { ImageType } from './image'

export type AnchorType = {
  title: string
  href?: string
}

export type TitleDescriptionType = {
  title: string
  description: string
}

export type TitleAnchorType = {
  title: string
  anchor: AnchorType
}

export type RelationItem = {
  title: string
  description: string
  icon: ImageType
  link: AnchorType
}

export type TextType = {
  text: string
}

export type ImageTextType = {
  image: ImageType
  text: string
}

export type TextFieldType = {
  label: string
  placeholder?: string
  error_text?: string
}

export type TitleContentType = {
  title: string
  content: unknown
}

export type AnchorImage = AnchorType & {
  icon: ImageType
}

export type FileType = ImageType
