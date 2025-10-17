import { Rectangle } from '../geometry/rectangle'
import { TextShape } from '../model/shape/text.shape'
import { Font } from '../paint/font'
import type { ShapeRenderer } from './shape.renderer'

class TextRenderer implements ShapeRenderer {
  render(context: CanvasRenderingContext2D, shape: TextShape, _dirtyRegion: Rectangle): void {
    const rawText = shape.getText()

    if (!rawText || rawText.length === 0) {
      return
    }

    const bytes = Uint8Array.from(rawText, c => c.charCodeAt(0))
    // Convert text to UTF-8 to ensure proper encoding
    const text = new TextDecoder('utf-8').decode(bytes)

    const bounds = shape.bounds
    const font = shape.getFont()

    if (!font) {
      throw new Error('Text shape must have a font.')
    }

    const transform = context.getTransform()
    const sx = transform.m11
    const sy = transform.m22

    /*
     * Render with identity transform and scaled font, since normalized
     * font size won't give us the desired result as the text will be
     * misplaced and missized.
     */
    const scaledHeight = font.size * sy
    const x = transform.m41 + bounds.x * sx
    const y = transform.m42 + bounds.y * sy

    const scaledFont = new Font(font.family, scaledHeight, font.style, font.weight)

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.font = scaledFont.toString()
    context.fillStyle = shape.getTextColor().toRgba()

    // Get font metrics
    const metrics = context.measureText('Ag') // Use a string with ascenders and descenders
    const fontAscent = metrics.actualBoundingBoxAscent
    const fontDescent = metrics.actualBoundingBoxDescent
    const fontLeading = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

    // Split text by line breaks and render each line separately
    const lines = text.split('\n')
    const lineHeight = fontLeading + fontDescent

    lines.forEach((line, index) => {
      const lineY = y + fontAscent + (index * lineHeight)
      context.fillText(line, x, lineY)
    })
  }
}

export { TextRenderer }
