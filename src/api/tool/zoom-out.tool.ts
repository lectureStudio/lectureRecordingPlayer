import { PenPoint } from '../geometry/pen-point'
import { Rectangle } from '../geometry/rectangle'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class ZoomOutTool extends AtomicTool {
  begin(_point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use ZoomOutTool')
    }

    context.page.getSlideShape().setPageRect(new Rectangle(0, 0, 1, 1))
  }
}

export { ZoomOutTool }
