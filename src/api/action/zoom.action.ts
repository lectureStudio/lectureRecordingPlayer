import { ZoomTool } from '../tool/zoom.tool'
import type { ActionExecutor } from './action-executor'
import { BrushAction } from './brush.action'

class ZoomAction extends BrushAction {
  execute(executor: ActionExecutor): void {
    if (this.keyEvent) {
      executor.setKeyEvent(this.keyEvent)
    }
    executor.setTool(new ZoomTool())
  }
}

export { ZoomAction }
