import { Brush } from '../paint/brush'
import { Action } from './action'

abstract class BrushAction extends Action {
  shapeHandle: number

  brush: Brush | undefined

  constructor(shapeHandle: number, brush?: Brush) {
    super()

    this.shapeHandle = shapeHandle
    this.brush = brush
  }
}

export { BrushAction }
