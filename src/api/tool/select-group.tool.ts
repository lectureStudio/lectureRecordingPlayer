import { PenPoint } from '../geometry/pen-point'
import { Rectangle } from '../geometry/rectangle'
import { SelectShape } from '../model/shape/select.shape'
import { Shape } from '../model/shape/shape'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

type Mode = 'Select' | 'Move'

class SelectGroupTool implements Tool {
  private mode: Mode = 'Select'

  private context: ToolContext | undefined

  private shape: SelectShape | undefined

  private selectedShapes: Shape[] = []

  private sourcePoint: PenPoint | undefined

  private initialized: boolean = false

  begin(point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use SelectGroupTool')
    }

    this.sourcePoint = point.clone()
    this.context = context
    this.initialized = false

    this.shape = new SelectShape()

    this.context!.page!.addShape(this.shape)

    this.getSelectedShapes()

    if (this.hasSelectedShapes()) {
      if (this.hitSelected(point)) {
        this.mode = 'Move'
      }
      else {
        this.context.beginBulkRender()
        this.removeSelection()
        this.context.endBulkRender()

        this.mode = 'Select'
      }
    }
    else {
      this.mode = 'Select'
    }
  }

  execute(point: PenPoint): void {
    if (this.mode == 'Select') {
      if (!this.initialized) {
        this.shape!.setP0(point)
        this.initialized = true
      }

      this.shape!.addPoint(point.clone())
      this.shape!.setP1(point)

      this.selectGroup(this.shape!.bounds)
    }
    else if (this.mode == 'Move') {
      this.sourcePoint!.subtract(point)

      this.moveShapes(this.sourcePoint!)

      this.sourcePoint = point.clone()
    }
  }

  end(_point: PenPoint): void {
    this.context!.page!.removeShape(this.shape!)

    this.initialized = false
  }

  selectGroup(rect: Rectangle): void {
    this.context!.beginBulkRender()

    this.removeSelection()

    for (const shape of this.context!.page!.getShapes()) {
      if (shape === this.shape) {
        continue
      }
      if (shape.intersects(rect)) {
        this.addSelection(shape)
      }
    }

    this.context!.endBulkRender()
  }

  private addSelection(shape: Shape): void {
    shape.setSelected(true)

    this.selectedShapes.push(shape)
  }

  private getSelectedShapes(): void {
    this.selectedShapes = new Array<Shape>()

    for (const shape of this.context!.page!.getShapes()) {
      if (shape.isSelected()) {
        this.selectedShapes.push(shape)
      }
    }
  }

  private hasSelectedShapes(): boolean {
    return this.selectedShapes.length != 0
  }

  private hitSelected(point: PenPoint): boolean {
    for (const shape of this.selectedShapes) {
      if (shape.contains(point)) {
        return true
      }
    }

    return false
  }

  private removeSelection(): void {
    for (const shape of this.selectedShapes) {
      shape.setSelected(false)
    }

    this.selectedShapes.length = 0
  }

  private moveShapes(delta: PenPoint): void {
    if (!this.hasSelectedShapes()) {
      return
    }

    this.context!.beginBulkRender()

    for (const shape of this.selectedShapes) {
      shape.moveByDelta(delta)
    }

    this.context!.endBulkRender()
  }
}

export { SelectGroupTool }
