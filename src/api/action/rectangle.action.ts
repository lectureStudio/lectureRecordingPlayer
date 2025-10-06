import { RectangleTool } from '../tool/rectangle.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class RectangleAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    const tool = new RectangleTool()
    tool.shapeHandle = this.shapeHandle
    tool.brush = this.brush

    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(tool)
  }
}

export { RectangleAction }
