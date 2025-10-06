import { PenPoint } from '../geometry/pen-point'
import { Shape } from '../model/shape/shape'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class SelectTool implements Tool {
  private sourcePoint: PenPoint | undefined

  private context: ToolContext | undefined

  private selectedShape: Shape | null = null

  begin(point: PenPoint, context: ToolContext): void {
    this.sourcePoint = point.clone()
    this.context = context

    this.selectedShape = this.getTopLevelShape(point)

    this.removeSelection()

    if (this.selectedShape != null) {
      this.selectedShape.setSelected(true)
    }
  }

  execute(point: PenPoint): void {
    if (this.selectedShape != null) {
      this.sourcePoint!.subtract(point)

      this.context!.beginBulkRender()
      this.selectedShape.moveByDelta(this.sourcePoint!)
      this.context!.endBulkRender()

      this.sourcePoint = point.clone()
    }
  }

  end(_point: PenPoint): void {
    if (this.selectedShape != null) {
      this.context!.beginBulkRender()
      this.selectedShape.setSelected(false)
      this.context!.endBulkRender()
    }
  }

  getTopLevelShape(point: PenPoint) {
    let shape = null

    for (const s of this.context!.page!.getShapes()) {
      if (s.contains(point)) {
        shape = s
      }
    }
    return shape
  }

  removeSelection(): void {
    this.context!.beginBulkRender()

    for (const shape of this.context!.page!.getShapes()) {
      if (shape.isSelected()) {
        shape.setSelected(false)
      }
    }

    this.context!.endBulkRender()
  }
}

export { SelectTool }
