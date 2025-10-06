import { Point } from '../geometry/point'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class RedoTool extends AtomicTool {
  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use RedoTool')
    }
    context.page.redo()
  }
}

export { RedoTool }
