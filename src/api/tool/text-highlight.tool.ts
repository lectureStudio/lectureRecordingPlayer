import { Point } from '../geometry/point'
import { Rectangle } from '../geometry/rectangle'
import { AddShapeAction } from '../model/action/add-shape.action'
import { TextHighlightShape } from '../model/shape/text-highlight.shape'
import { Color } from '../paint/color'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class TextHighlightTool implements Tool {
  private readonly color: Color

  private readonly textBounds: Rectangle[]

  private shape: TextHighlightShape | undefined

  constructor(color: Color, textBounds: Rectangle[]) {
    this.color = color
    this.textBounds = textBounds
  }

  begin(point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use TextHighlightTool')
    }

    for (const rect of this.textBounds) {
      if (rect.containsPoint(point)) {
        if (!this.shape) {
          this.shape = new TextHighlightShape(this.color)

          context.page.addAction(new AddShapeAction([this.shape]))
        }

        this.shape.addTextBounds(rect)
      }
    }
  }

  execute(point: Point): void {
    for (const rect of this.textBounds) {
      if (rect.containsPoint(point)) {
        this.shape!.addTextBounds(rect)
      }
    }
  }

  end(_point: Point): void {
    this.shape = undefined
  }
}

export { TextHighlightTool }
