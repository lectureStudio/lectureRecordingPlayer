import { Point } from '../geometry/point'
import { Rectangle } from '../geometry/rectangle'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class PanTool implements Tool {
  private context: ToolContext | undefined

  private lastPoint: Point | undefined

  begin(point: Point, context: ToolContext): void {
    this.context = context
    this.lastPoint = point
  }

  execute(point: Point): void {
    const slideShape = this.context!.page!.getSlideShape()
    const pageRect = slideShape.bounds

    const x = pageRect.x + (this.lastPoint!.x - point.x)
    const y = pageRect.y + (this.lastPoint!.y - point.y)

    slideShape.setPageRect(new Rectangle(x, y, pageRect.width, pageRect.height))

    this.lastPoint = point
  }

  end(_point: Point): void {
    // No-op
  }
}

export { PanTool }
