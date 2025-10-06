import { PenPoint } from '../geometry/pen-point'
import { ZoomShape } from '../model/shape/zoom.shape'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class ZoomTool implements Tool {
  private shape: ZoomShape | undefined

  private context: ToolContext | undefined

  private initialized = false

  begin(_point: PenPoint, context: ToolContext): void {
    if (!context.page) {
      throw new Error('Page is required to use ZoomTool')
    }

    this.context = context

    this.shape = new ZoomShape()

    context.page.addShape(this.shape)
  }

  execute(point: PenPoint): void {
    if (!this.initialized) {
      this.shape!.setP0(point)
      this.initialized = true
    }

    this.shape!.setP1(point)
  }

  end(_point: PenPoint): void {
    this.initialized = false

    this.context!.page!.removeShape(this.shape!)

    this.context!.page!.getSlideShape().setPageRect(this.shape!.bounds)
  }
}

export { ZoomTool }
