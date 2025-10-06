import { PenPoint } from '../geometry/pen-point'
import { AddShapeAction } from '../model/action/add-shape.action'
import { ArrowShape } from '../model/shape/arrow.shape'
import { PaintTool } from './paint.tool'
import { ToolContext } from './tool-context'

class ArrowTool extends PaintTool {
  private shape: ArrowShape | undefined

  private context: ToolContext | undefined

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use ArrowTool')
    }
    if (!this.brush) {
      throw new Error('Brush is required to use ArrowTool')
    }

    this.context = context

    this.shape = new ArrowShape(this.brush)
    this.shape.setHandle(this.shapeHandle)
    this.shape.setP0(point)

    context.page.addAction(new AddShapeAction([this.shape]))
  }

  execute(point: PenPoint): void {
    this.shape!.setKeyEvent(this.context!.keyEvent)
    this.shape!.setP1(point)
  }
}

export { ArrowTool }
