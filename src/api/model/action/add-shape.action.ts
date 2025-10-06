import { Page } from '../page'
import { Shape } from '../shape/shape'
import { ShapeAction } from './shape.action'

class AddShapeAction extends ShapeAction {
  constructor(shapes: Shape[]) {
    super(shapes)
  }

  execute(page: Page): void {
    for (const shape of this.shapes) {
      page.addShape(shape)
    }
  }

  undo(page: Page): void {
    for (const shape of this.shapes) {
      page.removeShape(shape)
    }
  }

  redo(page: Page): void {
    this.execute(page)
  }
}

export { AddShapeAction }
