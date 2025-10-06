import { Point } from '../../geometry/point'
import { Color } from '../../paint/color'
import { Shape } from './shape'
import { ShapeEvent } from './shape-event'

abstract class TypesettingShape extends Shape {
  private readonly handle: number

  private textAttributes: Map<string, boolean> = new Map()

  private textColor: Color = Color.fromHex('#000000')

  private text: string = ''

  constructor(handle: number) {
    super()

    this.handle = handle
  }

  getHandle(): number {
    return this.handle
  }

  setText(text: string): void {
    if (this.text === text) {
      return
    }

    this.text = text

    this.fireShapeEvent(new ShapeEvent(this, this.bounds))
  }

  getText(): string {
    return this.text
  }

  setTextColor(color: Color): void {
    if (this.textColor && this.textColor.equals(color)) {
      return
    }

    this.textColor = color

    this.fireShapeEvent(new ShapeEvent(this, this.bounds))
  }

  getTextColor(): Color {
    return this.textColor
  }

  setTextAttributes(attributes: Map<string, boolean>): void {
    // if (this.textAttributes.equals(attributes)) {
    // 	return;
    // }

    this.textAttributes = new Map(attributes)

    this.fireShapeEvent(new ShapeEvent(this, this.bounds))
  }

  getTextAttributes(): Map<string, boolean> {
    return this.textAttributes
  }

  isUnderline(): boolean {
    return this.textAttributes.get('underline') !== undefined
  }

  isStrikethrough(): boolean {
    return this.textAttributes.get('strikethrough') !== undefined
  }

  setLocation(point: Point): boolean {
    if (this.bounds.x === point.x && this.bounds.y === point.y) {
      return false
    }

    this.bounds.x = point.x
    this.bounds.y = point.y

    this.fireShapeEvent(new ShapeEvent(this, this.bounds))

    return true
  }

  protected updateBounds(): void {
  }
}

export { TypesettingShape }
