import { Color } from '../paint/color'
import { Action } from './action'

abstract class PaintAction extends Action {
  color: Color

  protected constructor(color: Color) {
    super()
    this.color = color
  }
}

export { PaintAction }
