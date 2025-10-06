import { PenTool } from '../tool/pen.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class PenAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    const tool = new PenTool()
    tool.shapeHandle = this.shapeHandle
    tool.brush = this.brush

    executor.setTool(tool)
  }
}

export { PenAction }
