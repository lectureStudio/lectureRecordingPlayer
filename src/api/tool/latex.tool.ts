import { PenPoint } from '../geometry/pen-point'
import { LatexShape } from '../model/shape/latex.shape'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class LatexTool implements Tool {
  private readonly handle: number

  private shape: LatexShape | undefined

  private context: ToolContext | undefined

  constructor(handle: number) {
    this.handle = handle
  }

  begin(_point: PenPoint, context: ToolContext): void {
    this.context = context

    this.shape = new LatexShape(this.handle)
  }

  execute(_point: PenPoint): void {
    // No-op
  }

  end(point: PenPoint): void {
    this.shape!.setLocation(point)

    this.context!.page!.addShape(this.shape!)
  }
}

export { LatexTool }
