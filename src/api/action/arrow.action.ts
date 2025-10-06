import { ArrowTool } from '../tool/arrow.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class ArrowAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    const tool = new ArrowTool()
    tool.shapeHandle = this.shapeHandle
    tool.brush = this.brush

    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }

    executor.setTool(tool)
  }
}

export { ArrowAction }
