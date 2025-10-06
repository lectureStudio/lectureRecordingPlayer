import { PanTool } from '../tool/pan.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class PanAction extends Action {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new PanTool())
  }
}

export { PanAction }
