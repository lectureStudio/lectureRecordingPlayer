import type { ActionExecutor } from './action-executor'
import { ToolAction } from './tool.action'

class ToolEndAction extends ToolAction {
  execute(executor: ActionExecutor): void {
    if (!this.point) {
      throw new Error('Point is not defined')
    }
    executor.endTool(this.point)
  }
}

export { ToolEndAction }
