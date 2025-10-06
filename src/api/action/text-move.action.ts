import { Point } from '../geometry/point'
import { TextMoveTool } from '../tool/text-move.tool'
import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class TextMoveAction extends Action {
  private readonly handle: number

  private readonly point: Point

  constructor(handle: number, point: Point) {
    super()

    this.handle = handle
    this.point = point
  }

  execute(executor: ActionExecutor): void {
    executor.selectAndExecuteTool(new TextMoveTool(this.handle, this.point))
  }
}

export { TextMoveAction }
