import { Point } from '../../geometry/point'
import { Font } from '../../paint/font'
import { ShapeEvent } from './shape-event'
import { TypesettingShape } from './typesetting.shape'

class LatexShape extends TypesettingShape {
  private font: Font | undefined = undefined

  setFont(font: Font): void {
    if (this.font && this.font.equals(font)) {
      return
    }

    this.font = font

    this.fireShapeEvent(new ShapeEvent(this, this.bounds))
  }

  getFont(): Font | undefined {
    return this.font
  }

  clone(): LatexShape {
    if (!this.font) {
      throw new Error('Font is not set')
    }

    const shape = new LatexShape(this.getHandle())
    shape.setLocation(new Point(this.bounds.x, this.bounds.y))
    shape.setFont(this.font)
    shape.setTextColor(this.getTextColor())
    shape.setTextAttributes(new Map(this.getTextAttributes()))

    return shape
  }
}

export { LatexShape }
