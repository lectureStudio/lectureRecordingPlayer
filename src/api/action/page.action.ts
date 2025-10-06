import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class PageAction extends Action {
  private readonly pageNumber: number

  constructor(pageNumber: number) {
    super()

    this.pageNumber = pageNumber
  }

  execute(executor: ActionExecutor): void {
    executor.setPageNumber(this.pageNumber)
  }
}

export { PageAction }
