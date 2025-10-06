import { Point } from '../geometry/point'
import { TypesettingShape } from '../model/shape/typesetting.shape'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class TextRemoveTool extends AtomicTool {
  private readonly handle: number

  constructor(handle: number) {
    super()

    this.handle = handle
  }

  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use TextRemoveTool')
    }

    const shapes = context.page.getShapes()

    for (const shape of shapes) {
      if (shape instanceof TypesettingShape && shape.getHandle() === this.handle) {
        context.page.removeShape(shape)
        break
      }
    }
  }
}

export { TextRemoveTool }
