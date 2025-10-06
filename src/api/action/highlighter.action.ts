import { HighlighterTool } from '../tool/highlighter.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class HighlighterAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    const tool = new HighlighterTool()
    tool.shapeHandle = this.shapeHandle
    tool.brush = this.brush

    executor.setTool(tool)
  }
}

export { HighlighterAction }
