import { PenPoint } from '../geometry/pen-point'
import { AddShapeAction } from '../model/action/add-shape.action'
import { LineShape } from '../model/shape/line.shape'
import { PaintTool } from './paint.tool'
import { ToolContext } from './tool-context'

class LineTool extends PaintTool {
  private shape: LineShape | undefined

  private context: ToolContext | undefined

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use LineTool')
    }
    if (!this.brush) {
      throw new Error('Brush is required to use LineTool')
    }

    this.context = context

    this.shape = new LineShape(this.brush)
    this.shape.setHandle(this.shapeHandle)
    this.shape.setP0(point)

    context.page.addAction(new AddShapeAction([this.shape]))
  }

  execute(point: PenPoint): void {
    this.shape!.setKeyEvent(this.context!.keyEvent)
    this.shape!.setP1(point)
  }
}

export { LineTool }
