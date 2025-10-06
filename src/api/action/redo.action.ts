import { RedoTool } from '../tool/redo.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class RedoAction extends Action {
  execute(executor: ActionExecutor): void {
    executor.selectAndExecuteTool(new RedoTool())
  }
}

export { RedoAction }
