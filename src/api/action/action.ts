import type { ActionExecutor } from './action-executor'

abstract class Action {
  keyEvent: KeyboardEvent | null = null

  timestamp: number = 0

  abstract execute(executor: ActionExecutor): void
}

export { Action }
