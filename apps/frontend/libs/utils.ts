import { BlocksContent } from '@strapi/blocks-react-renderer'
import { format } from 'date-fns/format'
import { enUS, id as idLocale } from 'date-fns/locale'

export const paginateList = <T>(list: Array<T>, pageNumber: number, itemsPerPage = 6): Array<T> => {
  const startIndex = (pageNumber - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return list.slice(startIndex, endIndex)
}

export const calculateTotalPages = (totalItems: number, itemsPerPage = 6): number => {
  if (itemsPerPage <= 0) {
    throw new Error('Items per page must be greater than zero.')
  }
  return Math.ceil(totalItems / itemsPerPage)
}

export const generateNumberArray = (n: number): number[] => {
  if (n < 1) {
    throw new Error('The value of n must be greater than 0')
  }
  return Array.from({ length: n }, (_, index) => index + 1)
}

export function toFormData<T extends object>(o: T) {
  return Object.entries(o).reduce((d, e) => (d.append(...e), d), new FormData())
}

export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

export const parseNumber = (value: string) => {
  const number = Number(value) // Parse to number

  // Check if the number is valid and not NaN
  return Number.isNaN(number) || value.trim() === '' ? undefined : number
}

export const formatDate = (
  date: Date,
  { formatter = 'dd MMMM yyyy', locale = 'en' }: { formatter?: string; locale?: 'en' | 'id' } = {}
): string => {
  const selectedLocale = locale === 'id' ? idLocale : enUS

  const result = format(date, formatter, { locale: selectedLocale })

  return result
}

export function routeWithLocale(locale: string, href: string) {
  if (href && href.at(0) === '/') {
    return '/' + locale + href
  } else {
    return href
  }
}

export function getFirstParagraphText(data: BlocksContent) {
  const firstParagraph = data.find((item) => item.type === 'paragraph' && item.children.length > 0)
  const firstText = firstParagraph?.children.find((item) => item.type === 'text')

  if (firstParagraph && firstText) {
    return firstText.text
  }

  return ''
}
