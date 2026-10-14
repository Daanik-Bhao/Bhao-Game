import type { ReactElement } from 'react'

export interface GalleryScreen {
  /** Route under /__ux/, e.g. 'dashboard-home' */
  path: string
  title: string
  group: string
  note?: string
  render: () => ReactElement
}
