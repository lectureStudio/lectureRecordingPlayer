import { Point } from '../geometry/point'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class UndoTool extends AtomicTool {
  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use UndoTool')
    }
    context.page.undo()
  }
}

export { UndoTool }
