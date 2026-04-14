/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAPI_CMS_BASE_URL: string
  readonly VITE_STRAPI_CMS_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
