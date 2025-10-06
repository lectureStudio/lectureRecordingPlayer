import { LineTool } from '../tool/line.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class LineAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    const tool = new LineTool()
    tool.shapeHandle = this.shapeHandle
    tool.brush = this.brush

    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(tool)
  }
}

export { LineAction }
