import { UndoTool } from '../tool/undo.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class UndoAction extends Action {
  execute(executor: ActionExecutor): void {
    executor.selectAndExecuteTool(new UndoTool())
  }
}

export { UndoAction }
