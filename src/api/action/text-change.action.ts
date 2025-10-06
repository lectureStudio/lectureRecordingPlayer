import { TextChangeTool } from '../tool/text-change.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class TextChangeAction extends Action {
  private readonly handle: number

  private readonly text: string

  constructor(handle: number, text: string) {
    super()

    this.handle = handle
    this.text = text
  }

  execute(executor: ActionExecutor): void {
    executor.selectAndExecuteTool(new TextChangeTool(this.handle, this.text))
  }
}

export { TextChangeAction }
