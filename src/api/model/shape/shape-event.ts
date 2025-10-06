import { Rectangle } from '../../geometry/rectangle'
import { Shape } from './shape'

class ShapeEvent {
  private readonly _shape: Shape

  private readonly _dirtyRegion: Rectangle

  constructor(shape: Shape, dirtyRegion: Rectangle) {
    this._shape = shape
    this._dirtyRegion = dirtyRegion
  }

  get shape(): Shape {
    return this._shape
  }

  get dirtyRegion(): Rectangle {
    return this._dirtyRegion
  }
}

export { ShapeEvent }
