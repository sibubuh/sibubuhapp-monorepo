export type ParamsWithLocale<T = unknown> = {
  params: {
    locale: string
  } & T
}

export type LayoutParamsWithLocale<T = unknown> = React.PropsWithChildren<{
  params: {
    locale: string
  } & T
}>
