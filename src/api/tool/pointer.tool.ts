import { PenPoint } from '../geometry/pen-point'
import { Page } from '../model/page'
import { PointerShape } from '../model/shape/pointer.shape'
import { PaintTool } from './paint.tool'
import { ToolContext } from './tool-context'

class PointerTool extends PaintTool {
  private shape: PointerShape | undefined

  private page: Page | undefined

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use PointerTool')
    }
    if (!this.brush) {
      throw new Error('Brush is required to use PointerTool')
    }
    this.page = context.page

    this.shape = new PointerShape(this.brush)
    this.shape.setHandle(this.shapeHandle)
    this.shape.addPoint(point)

    this.page.addShape(this.shape)
  }

  execute(point: PenPoint): void {
    this.shape!.addPoint(point)
  }

  end(_point: PenPoint): void {
    this.page!.removeShape(this.shape!)
  }
}

export { PointerTool }
