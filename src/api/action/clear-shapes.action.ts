import { ClearShapesTool } from '../tool/clear-shapes.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class ClearShapesAction extends Action {
  execute(executor: ActionExecutor): void {
    executor.selectAndExecuteTool(new ClearShapesTool())
  }
}

export { ClearShapesAction }
