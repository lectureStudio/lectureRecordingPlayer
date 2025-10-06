import { TextTool } from '../tool/text.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class TextAction extends Action {
  private readonly handle: number

  constructor(handle: number) {
    super()

    this.handle = handle
  }

  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new TextTool(this.handle))
  }
}

export { TextAction }
