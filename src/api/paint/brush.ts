import { Color } from './color'
import { Paint } from './paint'

class Brush extends Paint {
  width: number

  constructor(color: Color, width: number) {
    super(color)

    this.width = width
  }

  clone(): Brush {
    return new Brush(this.color, this.width)
  }
}

export { Brush }
