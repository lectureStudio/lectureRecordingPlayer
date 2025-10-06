import { Point } from '../geometry/point'
import { TypesettingShape } from '../model/shape/typesetting.shape'
import { AtomicTool } from './atomic.tool'
import { ToolContext } from './tool-context'

class TextChangeTool extends AtomicTool {
  private readonly handle: number

  private readonly text: string

  constructor(handle: number, text: string) {
    super()

    this.handle = handle
    this.text = text
  }

  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use TextChangeTool')
    }
    const shapes = context.page.getShapes()

    for (const shape of shapes) {
      if (shape instanceof TypesettingShape && shape.getHandle() === this.handle) {
        shape.setText(this.text)
        break
      }
    }
  }
}

export { TextChangeTool }
