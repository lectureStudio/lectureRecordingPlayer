import { SelectGroupTool } from '../tool/select-group.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class SelectGroupAction extends Action {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new SelectGroupTool())
  }
}

export { SelectGroupAction }
