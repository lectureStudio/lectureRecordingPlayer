import { PenPoint } from '../geometry/pen-point'
import { AddShapeAction } from '../model/action/add-shape.action'
import { PenShape } from '../model/shape/pen.shape'
import { PaintTool } from './paint.tool'
import { ToolContext } from './tool-context'

class PenTool extends PaintTool {
  private shape: PenShape | undefined

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use PenTool')
    }
    if (!this.brush) {
      throw new Error('Brush is required to use PenTool')
    }

    this.shape = new PenShape(this.brush)
    this.shape.setHandle(this.shapeHandle)
    this.shape.addPoint(point)

    context.page.addAction(new AddShapeAction([this.shape]))
  }

  execute(point: PenPoint): void {
    this.shape!.addPoint(point)
  }

  end(_point: PenPoint): void {
    // No-op
  }
}

export { PenTool }
