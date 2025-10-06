import { PenPoint } from '../geometry/pen-point'
import { AddShapeAction } from '../model/action/add-shape.action'
import { Shape } from '../model/shape/shape'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class CloneTool implements Tool {
  private sourcePoint: PenPoint | undefined

  private context: ToolContext | undefined

  private selectedShapes: Shape[] = []

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use CloneTool')
    }

    this.sourcePoint = point.clone()
    this.context = context

    this.getSelectedShapes()

    if (this.hasSelectedShapes()) {
      if (this.hitSelected(point) && this.selectedShapes) {
        const cloned = new Array<Shape>()

        for (const shape of this.selectedShapes) {
          const clonedShape = shape.clone()

          cloned.push(clonedShape)
        }

        context.page.addAction(new AddShapeAction(cloned))
      }
      else {
        this.removeSelection()
      }
    }
    else {
      const selectedShape = this.getTopLevelShape(point)

      if (selectedShape != null) {
        const clonedShape = selectedShape.clone()

        context.page.addAction(new AddShapeAction([clonedShape]))

        this.addSelection(clonedShape)
      }
    }
  }

  execute(point: PenPoint): void {
    this.sourcePoint!.subtract(point)

    this.moveShapes(point, this.sourcePoint!)

    this.sourcePoint = point.clone()
  }

  end(_point: PenPoint): void {
    // No-op
  }

  private getTopLevelShape(point: PenPoint): Shape | null {
    let shape = null

    for (const s of this.context!.page!.getShapes()) {
      if (s.contains(point)) {
        shape = s
      }
    }
    return shape
  }

  private getSelectedShapes(): void {
    this.selectedShapes = new Array<Shape>()

    for (const shape of this.context!.page!.getShapes()) {
      if (shape.isSelected()) {
        this.selectedShapes.push(shape)
      }
    }
  }

  private moveShapes(_point: PenPoint, delta: PenPoint): void {
    if (!this.hasSelectedShapes()) {
      return
    }

    this.context!.beginBulkRender()

    for (const shape of this.selectedShapes) {
      shape.moveByDelta(delta)
    }

    this.context!.endBulkRender()
  }

  private hasSelectedShapes(): boolean {
    return this.selectedShapes !== undefined && this.selectedShapes.length != 0
  }

  private addSelection(shape: Shape): void {
    shape.setSelected(true)

    this.selectedShapes.push(shape)
  }

  private removeSelection(): void {
    this.context!.beginBulkRender()

    for (const shape of this.selectedShapes) {
      shape.setSelected(false)
    }

    this.selectedShapes.length = 0

    this.context!.endBulkRender()
  }

  private hitSelected(point: PenPoint): boolean {
    for (const shape of this.selectedShapes) {
      if (shape.contains(point)) {
        return true
      }
    }

    return false
  }
}

export { CloneTool }
