import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class KeyAction extends Action {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
  }
}

export { KeyAction }
