import { Rectangle } from '../geometry/rectangle'
import { TextShape } from '../model/shape/text.shape'
import { Font } from '../paint/font'
import type { ShapeRenderer } from './shape.renderer'

class TextRenderer implements ShapeRenderer {
  render(context: CanvasRenderingContext2D, shape: TextShape, _dirtyRegion: Rectangle): void {
    const text = shape.getText()

    if (!text || text.length === 0) {
      return
    }

    const bounds = shape.bounds
    const font = shape.getFont()

    if (!font) {
      throw new Error('Text shape must have a font.')
    }

    const transform = context.getTransform()
    const scale = transform.m11

    /*
     * Render with identity transform and scaled font, since normalized
     * font size won't give us the desired result as the text will be
     * misplaced and missized.
     */
    const scaledHeight = font.size * scale
    const x = transform.m31 + bounds.x * scale
    const y = transform.m32 + bounds.y * scale

    const scaledFont = new Font(font.family, scaledHeight, font.style, font.weight)

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.font = scaledFont.toString()
    context.fillStyle = shape.getTextColor().toRgba()
    context.fillText(text, x, y + scaledHeight)
  }
}

export { TextRenderer }
