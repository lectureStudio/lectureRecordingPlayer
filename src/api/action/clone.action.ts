import { CloneTool } from '../tool/clone.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class CloneAction extends Action {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new CloneTool())
  }
}

export { CloneAction }
