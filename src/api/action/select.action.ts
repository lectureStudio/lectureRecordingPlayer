import { SelectTool } from '../tool/select.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class SelectAction extends Action {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new SelectTool())
  }
}

export { SelectAction }
