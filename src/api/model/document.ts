import { Page } from './page'

abstract class SlideDocument {
  protected pages: Page[] = []

  constructor() {
  }

  getPageCount(): number {
    return this.pages.length
  }

  getPage(pageNumber: number): Page | undefined {
    if (pageNumber < 0 || pageNumber > this.pages.length - 1) {
      throw new Error(`Page number ${pageNumber} out of bounds.`)
    }
    return this.pages[pageNumber]
  }
}

export { SlideDocument }
