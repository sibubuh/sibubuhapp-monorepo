import { STRAPI_CMS_BASE_URL, STRAPI_CMS_TOKEN } from '../config/strapi'

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const authToken = '1e3229c5d7176fcc5457977b02413b1f36a088f7b646881d01cf47a07708db272613a8c668c61cd51374c0123611adba62f8a52d648b761608a4e3331b239d29ee7d2f5b252f168ac238a2b1fe591d6d5b7459cd73b4618364c0214bf27eec747723b6b193171c9c941c05cf862812b003d41435cd9833247e3a17c885e364ce'
  const baseURL = 'http://localhost:3080'

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    ...(options.headers || {}),
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  const response = await fetch(`${baseURL}${endpoint}`, config)

  if (!response.ok) {
    if (import.meta.env.NODE_ENV === 'development') {
      const error = await response.json()
      // eslint-disable-next-line no-console
      console.log(`${baseURL}${endpoint}:`, error)
    }
    return null
  }
  return await response.json()
}

export default fetchWithAuth
