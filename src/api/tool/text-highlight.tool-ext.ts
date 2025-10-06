import { Point } from '../geometry/point'
import { Rectangle } from '../geometry/rectangle'
import { AddShapeAction } from '../model/action/add-shape.action'
import { TextHighlightShape } from '../model/shape/text-highlight.shape'
import { Color } from '../paint/color'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class TextHighlightToolExt implements Tool {
  private readonly shapeHandle: number

  private readonly color: Color

  private readonly textBounds: Rectangle[]

  constructor(shapeHandle: number, color: Color, textBounds: Rectangle[]) {
    this.shapeHandle = shapeHandle
    this.color = color
    this.textBounds = textBounds
  }

  begin(_point: Point, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use TextHighlightToolExt')
    }

    for (const rect of this.textBounds) {
      let shape = context.page.getShapeByHandle(this.shapeHandle) as TextHighlightShape

      if (!shape) {
        shape = new TextHighlightShape(this.color)
        shape.setHandle(this.shapeHandle)

        context.page.addAction(new AddShapeAction([shape]))
      }

      shape.addTextBounds(rect)
    }
  }

  execute(_point: Point): void {
    // No-op
  }

  end(_point: Point): void {
    // No-op
  }
}

export { TextHighlightToolExt }
