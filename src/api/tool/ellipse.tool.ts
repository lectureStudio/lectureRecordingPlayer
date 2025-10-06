import { PenPoint } from '../geometry/pen-point'
import { AddShapeAction } from '../model/action/add-shape.action'
import { EllipseShape } from '../model/shape/ellipse.shape'
import { PaintTool } from './paint.tool'
import { ToolContext } from './tool-context'

class EllipseTool extends PaintTool {
  private shape: EllipseShape | undefined

  private context: ToolContext | undefined

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use EllipseTool')
    }
    if (!this.brush) {
      throw new Error('Brush is required to use EllipseTool')
    }

    this.context = context

    this.shape = new EllipseShape(this.brush)
    this.shape.setHandle(this.shapeHandle)
    this.shape.setP0(point)

    context.page.addAction(new AddShapeAction([this.shape]))
  }

  execute(point: PenPoint): void {
    this.shape!.setKeyEvent(this.context!.keyEvent)
    this.shape!.setP1(point)
  }
}

export { EllipseTool }
