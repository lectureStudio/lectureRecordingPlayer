import { PenPoint } from '../geometry/pen-point'
import { AddShapeAction } from '../model/action/add-shape.action'
import { RectangleShape } from '../model/shape/rectangle.shape'
import { PaintTool } from './paint.tool'
import { ToolContext } from './tool-context'

class RectangleTool extends PaintTool {
  private shape: RectangleShape | undefined

  private context: ToolContext | undefined

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use RectangleTool')
    }
    if (!this.brush) {
      throw new Error('Brush is required to use RectangleTool')
    }

    this.context = context

    this.shape = new RectangleShape(this.brush)
    this.shape.setHandle(this.shapeHandle)
    this.shape.setP0(point)

    context.page.addAction(new AddShapeAction([this.shape]))
  }

  execute(point: PenPoint): void {
    this.shape!.setKeyEvent(this.context!.keyEvent)
    this.shape!.setP1(point)
  }
}

export { RectangleTool }
