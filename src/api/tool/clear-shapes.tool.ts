import { Point } from '../geometry/point'
import { RemoveShapeAction } from '../model/action/remove-shape.action'
import { Shape } from '../model/shape/shape'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class ClearShapesTool extends AtomicTool {
  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use ClearShapesTool')
    }
    const shapes: Shape[] = Object.assign([], context.page.getShapes())

    context.page.addAction(new RemoveShapeAction(shapes))
  }
}

export { ClearShapesTool }
