import type { ActionExecutor } from './action-executor'
import { ToolAction } from './tool.action'

class ToolBeginAction extends ToolAction {
  execute(executor: ActionExecutor): void {
    if (!this.point) {
      throw new Error('Point is not defined')
    }
    executor.beginTool(this.point)
  }
}

export { ToolBeginAction }
