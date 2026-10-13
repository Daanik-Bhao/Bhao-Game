import type { GalleryScreen } from './types'
import { BASE_SCREENS } from './base'
import { MENU_SCREENS } from './menus'
import { BOARD_SCREENS } from './board'
import { FLOW_SCREENS } from './flows'

export type { GalleryScreen } from './types'

/** All /__ux screens. base = Agent 3 (components), menus = helper A, board = helper B, flows = Agent 3. */
export const GALLERY_SCREENS: GalleryScreen[] = [...BASE_SCREENS, ...MENU_SCREENS, ...BOARD_SCREENS, ...FLOW_SCREENS]
