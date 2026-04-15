export type PaginationParams = {
  page?: number
  pageSize: number
  withCount?: boolean
}

export type DataPagination<T> = {
  data: T[]
  meta: {
    pagination?: PaginationMeta
  }
}

export type PaginationMeta = {
  page: number
  pageSize: number
  pageCount: number
  total: number
}
