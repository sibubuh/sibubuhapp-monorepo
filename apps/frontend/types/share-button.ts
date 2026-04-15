type SharerGroup = {
  label: string
  prefix_url: string
  is_shown: boolean
}

export type ShareButton = {
  label: string
  sharer_group: SharerGroup[]
}
