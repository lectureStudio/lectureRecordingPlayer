import { Rectangle } from '../geometry/rectangle'
import { Page } from './page'
import { Shape } from './shape/shape'

class PageEvent {
  private _changeType: PageChangeType

  private _page: Page

  private _shape: Shape | undefined

  private _dirtyRegion: Rectangle | undefined

  constructor(page: Page, changeType: PageChangeType, shape?: Shape, dirtyRegion?: Rectangle) {
    this._page = page
    this._changeType = changeType
    this._shape = shape
    this._dirtyRegion = dirtyRegion
  }

  get changeType(): PageChangeType {
    return this._changeType
  }

  get page(): Page {
    return this._page
  }

  get shape(): Shape | undefined {
    return this._shape
  }

  get dirtyRegion(): Rectangle | undefined {
    return this._dirtyRegion
  }
}

const PageChangeType = {
  Clear: 'Clear',
  ShapeAdded: 'ShapeAdded',
  ShapeRemoved: 'ShapeRemoved',
  ShapeModified: 'ShapeModified',
  PageTransform: 'PageTransform',
} as const

type PageChangeType = typeof PageChangeType[keyof typeof PageChangeType]

export { PageChangeType, PageEvent }
