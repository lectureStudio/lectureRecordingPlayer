import { PenPoint } from '../geometry/pen-point'
import { TextShape } from '../model/shape/text.shape'
import type { Tool } from './tool'
import { ToolContext } from './tool-context'

class TextTool implements Tool {
  private readonly handle: number

  private shape: TextShape | undefined

  private context: ToolContext | undefined

  constructor(handle: number) {
    this.handle = handle
  }

  begin(_point: PenPoint, context: ToolContext): void {
    this.context = context

    this.shape = new TextShape(this.handle)
  }

  execute(_point: PenPoint): void {
    // No-op
  }

  end(point: PenPoint): void {
    this.shape!.setLocation(point)

    this.context!.page!.addShape(this.shape!)
  }
}

export { TextTool }
