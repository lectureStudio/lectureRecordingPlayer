import { Rectangle } from '../geometry/rectangle'
import { Color } from '../paint/color'
import { TextHighlightTool } from '../tool/text-highlight.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class TextHighlightAction extends Action {
  private readonly color: Color

  private readonly textBounds: Rectangle[]

  constructor(color: Color, textBounds: Rectangle[]) {
    super()

    this.color = color
    this.textBounds = textBounds
  }

  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new TextHighlightTool(this.color, this.textBounds))
  }
}

export { TextHighlightAction }
