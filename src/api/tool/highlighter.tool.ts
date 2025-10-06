import { PenPoint } from '../geometry/pen-point'
import { AddShapeAction } from '../model/action/add-shape.action'
import { StrokeShape } from '../model/shape/stroke.shape'
import { PaintTool } from './paint.tool'
import { ToolContext } from './tool-context'

class HighlighterTool extends PaintTool {
  private shape: StrokeShape | undefined

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use HighlighterTool')
    }
    if (!this.brush) {
      throw new Error('Brush is required to use HighlighterTool')
    }

    this.shape = new StrokeShape(this.brush)
    this.shape.setHandle(this.shapeHandle)
    this.shape.addPoint(point)

    context.page.addAction(new AddShapeAction([this.shape]))
  }

  execute(point: PenPoint): void {
    this.shape!.addPoint(point)
  }
}

export { HighlighterTool }
