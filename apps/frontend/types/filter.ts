export type Filters = {
  slug?: {
    $eq?: string
    $ne?: string
  }
  [key: string]: unknown
}
