import { Rectangle } from '../geometry/rectangle'
import { ExtendViewTool } from '../tool/extend-view.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class ExtendViewAction extends Action {
  private readonly rect: Rectangle

  constructor(rect: Rectangle) {
    super()

    this.rect = rect
  }

  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.selectAndExecuteTool(new ExtendViewTool(this.rect))
  }
}

export { ExtendViewAction }
