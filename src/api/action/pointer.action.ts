import { PointerTool } from '../tool/pointer.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class PointerAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    const tool = new PointerTool()
    tool.shapeHandle = this.shapeHandle
    tool.brush = this.brush

    executor.setTool(tool)
  }
}

export { PointerAction }
