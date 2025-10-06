import { PenPoint } from '../geometry/pen-point'
import { RemoveShapeAction } from '../model/action/remove-shape.action'
import { Shape } from '../model/shape/shape'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class RubberTool implements Tool {
  private context: ToolContext | undefined

  begin(_point: PenPoint, context: ToolContext): void {
    this.context = context
  }

  execute(point: PenPoint): void {
    const toDelete = new Array<Shape>()

    for (const shape of this.context!.page!.getShapes()) {
      if (shape.contains(point)) {
        toDelete.push(shape)
      }
    }

    if (toDelete.length != 0) {
      this.context!.page!.addAction(new RemoveShapeAction(toDelete))
    }
  }

  end(_point: PenPoint): void {
    // No-op
  }
}

export { RubberTool }
