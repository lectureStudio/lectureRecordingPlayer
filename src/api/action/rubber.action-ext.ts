import { RubberToolExt } from '../tool/rubber.tool-ext'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class RubberActionExt extends Action {
  shapeHandle: number

  constructor(shapeHandle: number) {
    super()

    this.shapeHandle = shapeHandle
  }

  execute(executor: ActionExecutor): void {
    executor.selectAndExecuteTool(new RubberToolExt(this.shapeHandle))
  }
}

export { RubberActionExt }
