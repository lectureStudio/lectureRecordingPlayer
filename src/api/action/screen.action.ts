import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class ScreenAction extends Action {
  execute(_executor: ActionExecutor): void {
    // Ignore. Rendering will take place in other components, e.g., VideoReader.
  }
}

export { ScreenAction }
