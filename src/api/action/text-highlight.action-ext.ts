import { Rectangle } from '../geometry/rectangle'
import { Color } from '../paint/color'
import { TextHighlightToolExt } from '../tool/text-highlight.tool-ext'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class TextHighlightActionExt extends Action {
  private readonly shapeHandle: number

  private readonly color: Color

  private readonly textBounds: Rectangle[]

  constructor(shapeHandle: number, color: Color, textBounds: Rectangle[]) {
    super()

    this.shapeHandle = shapeHandle
    this.color = color
    this.textBounds = textBounds
  }

  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.selectAndExecuteTool(new TextHighlightToolExt(this.shapeHandle, this.color, this.textBounds))
  }
}

export { TextHighlightActionExt }
