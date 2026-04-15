export type PDFType = {
  id: number
  url: string
  name: string
  size: boolean
  ext: string
  mime: string
}

export type DownloadItemType = {
  id: number
  title: string
  file: PDFType
}

export type MultipleDownloadItemType = {
  id: number
  items: DownloadItemType[]
}

export type GroupDownloadItem = {
  label: string
  items: DownloadItemType[]
}
