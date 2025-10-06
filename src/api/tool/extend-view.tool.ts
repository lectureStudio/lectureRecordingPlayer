import { Point } from '../geometry/point'
import { Rectangle } from '../geometry/rectangle'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class ExtendViewTool extends AtomicTool {
  private readonly rect: Rectangle

  constructor(rect: Rectangle) {
    super()

    this.rect = rect
  }

  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use ExtendViewTool')
    }
    context.page.getSlideShape().setPageRect(this.rect)
  }
}

export { ExtendViewTool }
