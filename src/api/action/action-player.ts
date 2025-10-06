import { ExecutableBase } from '../utils/executable-base'
import type { ActionExecutor } from './action-executor'

abstract class ActionPlayer extends ExecutableBase {
  protected readonly executor: ActionExecutor

  protected constructor(executor: ActionExecutor) {
    super()

    this.executor = executor
  }

  getExecutor(): ActionExecutor {
    return this.executor
  }

  abstract seekByTime(time: number): number

  abstract seekByPage(pageNumber: number): number

  protected abstract executeActions(): void
}

export { ActionPlayer }
