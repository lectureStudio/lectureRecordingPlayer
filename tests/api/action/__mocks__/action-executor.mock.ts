import type { ActionExecutor } from '@/api/action/action-executor'
import type { Tool } from '@/api/tool/tool'
import { PenPoint } from '@/api/geometry/pen-point'
import { AtomicTool } from '@/api/tool/atomic.tool'

export class MockActionExecutor implements ActionExecutor {
  public onSelectPageIndexObserver: ((value: number) => void) | null = null
  public seekValue: boolean = false
  public keyEventValue: KeyboardEvent | null = null
  public pageNumberValue: number = 0
  public toolValue: Tool | null = null
  public beginToolPoint: PenPoint | null = null
  public executeToolPoint: PenPoint | null = null
  public endToolPoint: PenPoint | null = null
  public executedAtomicTool: AtomicTool | null = null

  // Tracking properties
  public setKeyEventCalled: boolean = false
  public setToolCalled: boolean = false
  public setToolCalledWith: Tool | null = null

  setOnSelectPageIndex(observer: (value: number) => void): void {
    this.onSelectPageIndexObserver = observer
  }

  setSeek(seek: boolean): void {
    this.seekValue = seek
  }

  setKeyEvent(keyEvent: KeyboardEvent): void {
    this.keyEventValue = keyEvent
    this.setKeyEventCalled = true
  }

  setPageNumber(pageNumber: number): void {
    this.pageNumberValue = pageNumber
  }

  setTool(tool: Tool): void {
    this.toolValue = tool
    this.setToolCalled = true
    this.setToolCalledWith = tool
  }

  selectAndExecuteTool(tool: AtomicTool): void {
    this.executedAtomicTool = tool
  }

  beginTool(point: PenPoint): void {
    this.beginToolPoint = point
  }

  executeTool(point: PenPoint): void {
    this.executeToolPoint = point
  }

  endTool(point: PenPoint): void {
    this.endToolPoint = point
  }

  reset(): void {
    this.onSelectPageIndexObserver = null
    this.seekValue = false
    this.keyEventValue = null
    this.pageNumberValue = 0
    this.toolValue = null
    this.beginToolPoint = null
    this.executeToolPoint = null
    this.endToolPoint = null
    this.executedAtomicTool = null
    this.setKeyEventCalled = false
    this.setToolCalled = false
    this.setToolCalledWith = null
  }
}
