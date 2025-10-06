import { RubberTool } from '../tool/rubber.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class RubberAction extends Action {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new RubberTool())
  }
}

export { RubberAction }
