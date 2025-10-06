import { ZoomOutTool } from '../tool/zoom-out.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class ZoomOutAction extends Action {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.selectAndExecuteTool(new ZoomOutTool())
  }
}

export { ZoomOutAction }
