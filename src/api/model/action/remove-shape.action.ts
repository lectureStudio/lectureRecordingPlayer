import { Page } from '../page'
import { Shape } from '../shape/shape'
import { ShapeAction } from './shape.action'

class RemoveShapeAction extends ShapeAction {
  constructor(shapes: Shape[]) {
    super(shapes)
  }

  execute(page: Page): void {
    for (const shape of this.shapes) {
      page.removeShape(shape)
    }
  }

  undo(page: Page): void {
    for (const shape of this.shapes) {
      page.addShape(shape)
    }
  }

  redo(page: Page): void {
    this.execute(page)
  }
}

export { RemoveShapeAction }
