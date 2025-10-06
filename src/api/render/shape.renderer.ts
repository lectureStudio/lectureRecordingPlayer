import { Rectangle } from '../geometry/rectangle'
import { Shape } from '../model/shape/shape'

interface ShapeRenderer {
  render(context: CanvasRenderingContext2D, shape: Shape, dirtyRegion?: Rectangle): void
}

export type { ShapeRenderer }
