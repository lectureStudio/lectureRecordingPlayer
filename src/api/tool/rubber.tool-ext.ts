import { PenPoint } from '../geometry/pen-point'
import { RemoveShapeAction } from '../model/action/remove-shape.action'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class RubberToolExt implements Tool {
  private readonly shapeHandle: number

  private context: ToolContext | undefined

  constructor(shapeHandle: number) {
    this.shapeHandle = shapeHandle
  }

  begin(_point: PenPoint, context: ToolContext): void {
    this.context = context
  }

  execute(_point: PenPoint): void {
    const shape = this.context!.page!.getShapeByHandle(this.shapeHandle)

    if (shape) {
      this.context!.page!.addAction(new RemoveShapeAction([shape]))
    }
  }

  end(_point: PenPoint): void {
    // No-op
  }
}

export { RubberToolExt }
