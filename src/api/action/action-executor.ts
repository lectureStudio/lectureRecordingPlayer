import { PenPoint } from '@/api/geometry/pen-point'
import { AtomicTool } from '@/api/tool/atomic.tool'
import type { Tool } from '@/api/tool/tool'

/**
 * Represents an executor for handling tool actions and page interactions
 * in the application.
 */
interface ActionExecutor {
  /**
   * Sets an observer function to be called when the page index is selected.
   *
   * @param observer - The callback function that receives the selected page index.
   */
  setOnSelectPageIndex(observer: (value: number) => void): void

  /**
   * Enables or disables seek mode.
   *
   * @param seek - Whether seek mode should be enabled.
   */
  setSeek(seek: boolean): void

  /**
   * Handles keyboard event input.
   *
   * @param keyEvent - The keyboard event to process.
   */
  setKeyEvent(keyEvent: KeyboardEvent): void

  /**
   * Sets the current page number.
   *
   * @param pageNumber - The page number to set.
   */
  setPageNumber(pageNumber: number): void

  /**
   * Sets the current active tool.
   *
   * @param tool - The tool to set as active.
   */
  setTool(tool: Tool): void

  /**
   * Selects and immediately executes a specified atomic tool.
   *
   * @param tool - The atomic tool to execute.
   */
  selectAndExecuteTool(tool: AtomicTool): void

  /**
   * Begins a tool operation at the specified point.
   *
   * @param point - The pen point where the tool operation begins.
   */
  beginTool(point: PenPoint): void

  /**
   * Continues executing the current tool at the specified point.
   *
   * @param point - The current pen point during tool execution.
   */
  executeTool(point: PenPoint): void

  /**
   * Finalizes the tool operation at the specified point.
   *
   * @param point - The pen point where the tool operation ends.
   */
  endTool(point: PenPoint): void
}

export type { ActionExecutor }
