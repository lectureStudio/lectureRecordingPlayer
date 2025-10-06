import { PenPoint } from '../geometry/pen-point'
import { Action } from './action'

abstract class ToolAction extends Action {
  point: PenPoint | undefined

  constructor(point?: PenPoint) {
    super()

    this.point = point
  }
}

export { ToolAction }
