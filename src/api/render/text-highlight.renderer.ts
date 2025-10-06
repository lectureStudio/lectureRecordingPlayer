import { Rectangle } from '../geometry/rectangle'
import { TextHighlightShape } from '../model/shape/text-highlight.shape'
import type { ShapeRenderer } from './shape.renderer'

class TextHighlightRenderer implements ShapeRenderer {
  render(context: CanvasRenderingContext2D, shape: TextHighlightShape, _dirtyRegion: Rectangle): void {
    const bounds = shape.bounds

    if (bounds.isEmpty()) {
      return
    }

    context.beginPath()
    context.globalAlpha = 1
    context.globalCompositeOperation = 'multiply'
    context.fillStyle = shape.getColor().toRgba()
    context.rect(bounds.x, bounds.y, bounds.width, bounds.height)
    context.fill()
  }
}

export { TextHighlightRenderer }
