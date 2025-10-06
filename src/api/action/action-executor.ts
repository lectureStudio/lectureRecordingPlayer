import { PenPoint } from '@/api/geometry/pen-point'
import { AtomicTool } from '@/api/tool/atomic.tool'
import type { Tool } from '@/api/tool/tool.ts'

interface ActionExecutor {
  setOnSelectPageIndex(observer: (value: number) => void): void

  setSeek(seek: boolean): void

  setKeyEvent(keyEvent: KeyboardEvent): void

  setPageNumber(pageNumber: number): void

  setTool(tool: Tool): void

  selectAndExecuteTool(tool: AtomicTool): void

  beginTool(point: PenPoint): void

  executeTool(point: PenPoint): void

  endTool(point: PenPoint): void
}

export type { ActionExecutor }
