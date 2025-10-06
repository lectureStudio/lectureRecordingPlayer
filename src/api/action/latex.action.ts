import { LatexTool } from '../tool/latex.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class LatexAction extends Action {
  private readonly handle: number

  constructor(handle: number) {
    super()

    this.handle = handle
  }

  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new LatexTool(this.handle))
  }
}

export { LatexAction }
