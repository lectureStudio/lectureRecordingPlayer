import { Point } from '../geometry/point'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

abstract class AtomicTool implements Tool {
  abstract begin(point: Point, context: ToolContext): void

  execute(_point: Point): void {
    // No action
  }

  end(_point: Point): void {
    // No action
  }
}

export { AtomicTool }
