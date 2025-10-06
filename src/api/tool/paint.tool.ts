import { PenPoint } from '../geometry/pen-point'
import { Brush } from '../paint/brush'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

abstract class PaintTool implements Tool {
  shapeHandle: number = 0

  brush: Brush | undefined = undefined

  begin(_point: PenPoint, _context: ToolContext): void {
  }

  execute(_point: PenPoint): void {
  }

  end(_point: PenPoint): void {
  }
}

export { PaintTool }
