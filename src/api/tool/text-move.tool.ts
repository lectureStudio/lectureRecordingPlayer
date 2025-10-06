import { Point } from '../geometry/point'
import { TypesettingShape } from '../model/shape/typesetting.shape'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class TextMoveTool extends AtomicTool {
  private readonly handle: number

  private readonly point: Point

  constructor(handle: number, point: Point) {
    super()

    this.handle = handle
    this.point = point
  }

  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use TextMoveTool')
    }

    const shapes = context.page.getShapes()

    for (const shape of shapes) {
      if (shape instanceof TypesettingShape && shape.getHandle() === this.handle) {
        context.beginBulkRender()
        shape.setLocation(this.point)
        context.endBulkRender()
        break
      }
    }
  }
}

export { TextMoveTool }
