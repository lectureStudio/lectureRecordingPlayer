import { EllipseTool } from '../tool/ellipse.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class EllipseAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    const tool = new EllipseTool()
    tool.shapeHandle = this.shapeHandle
    tool.brush = this.brush

    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(tool)
  }
}

export { EllipseAction }
