import { Action } from '@/api/action/action.ts'
import type { Page } from '@/api/model/page.ts'
import { RecordedPage } from '@/api/model/recorded-page.ts'
import { PenPoint } from '../geometry/pen-point'
import { SlideDocument } from '../model/document'
import { AtomicTool } from '../tool/atomic.tool'
import type { Tool } from '../tool/tool'
import { ToolContext } from '../tool/tool-context'
import type { ActionExecutor } from './action-executor'

/**
 * A simple implementation of the ActionExecutor interface that manages tools and actions
 * within a slide document context.
 */
class SimpleActionExecutor implements ActionExecutor {
  /** The slide document this executor operates on. */
  private readonly document: SlideDocument

  /**Context providing environment information for tools. */
  private readonly toolContext: ToolContext

  /** The currently active tool. */
  private tool: Tool | undefined

  /** The previously active non-atomic tool. */
  private previousTool: Tool | undefined

  /** The currently active page number. */
  private pageNumber: number | undefined

  /**
   * Creates a new SimpleActionExecutor instance.
   *
   * @param document The slide document to operate on.
   */
  constructor(document: SlideDocument) {
    this.document = document
    this.toolContext = new ToolContext()
  }

  /**
   * Sets an observer function to be called when a page is selected.
   *
   * @param _observer Function that receives the selected page number.
   */
  setOnSelectPageIndex(_observer: (page: number) => void): void {
    // No-op
  }

  /**
   * Sets the seek status.
   *
   * @param _seek Boolean indicating whether to seek
   */
  setSeek(_seek: boolean): void {
    // No-op
  }

  /**
   * Sets the current keyboard event in the tool context.
   *
   * @param keyEvent The keyboard event to set.
   */
  setKeyEvent(keyEvent: KeyboardEvent): void {
    this.toolContext.keyEvent = keyEvent
  }

  /**
   * Gets a page by its page number from the document.
   *
   * @param pageNumber The page number to retrieve.
   *
   * @returns The page or undefined if not found.
   */
  getPage(pageNumber: number): Page | undefined {
    return this.document.getPage(pageNumber)
  }

  /**
   * Sets the current page number and updates the tool context.
   * If the page number is the same as current, no action is taken.
   *
   * @param pageNumber The page number to set as active.
   */
  setPageNumber(pageNumber: number): void {
    if (this.pageNumber === pageNumber) {
      return
    }

    const page = this.document.getPage(pageNumber)

    this.pageNumber = pageNumber
    this.toolContext.page = page
  }

  /**
   * Sets the current tool to use.
   *
   * @param tool The tool to set as active.
   *
   * @throws Error if tool is null.
   */
  setTool(tool: Tool): void {
    if (!tool) {
      throw new Error('Tool must not be null')
    }
    if (!this.tool && this.tool === tool) {
      return
    }

    this.setPreviousTool(this.tool)

    this.tool = tool
  }

  /**
   * Selects a tool and executes it at the zero coordinate point.
   * After execution, restores the previous tool.
   *
   * @param tool The atomic tool to select and execute.
   */
  selectAndExecuteTool(tool: AtomicTool): void {
    const point = PenPoint.createZero()

    this.setTool(tool)

    this.beginTool(point)
    this.executeTool(point)
    this.endTool(point)

    this.setPreviousTool(this.previousTool)
  }

  /**
   * Begins the active tool operation at the specified point.
   *
   * @param point The pen point where the tool operation begins.
   */
  beginTool(point: PenPoint): void {
    this.tool?.begin(point.clone(), this.toolContext)
  }

  /**
   * Executes the active tool at the specified point.
   *
   * @param point The pen point where to execute the tool.
   */
  executeTool(point: PenPoint): void {
    this.tool?.execute(point.clone())
  }

  /**
   * Ends the active tool operation at the specified point.
   *
   * @param point The pen point where the tool operation ends.
   */
  endTool(point: PenPoint): void {
    this.tool?.end(point.clone())
  }

  /**
   * Loads all shapes (both static and playback) from a recorded page.
   *
   * @param recPage The recorded page containing shapes to load.
   */
  loadAllShapes(recPage: RecordedPage | undefined): void {
    if (!recPage) {
      return
    }

    this.setPageNumber(recPage.pageNumber)
    this.executeActions(recPage.staticActions)
    this.executeActions(recPage.playbackActions)
  }

  /**
   * Loads only static shapes from a recorded page.
   *
   * @param recPage The recorded page containing static shapes to load.
   */
  loadStaticShapes(recPage: RecordedPage | undefined): void {
    if (!recPage) {
      return
    }

    const staticActions = recPage.staticActions
    if (staticActions.length < 1) {
      return
    }

    // Select the page to which to add static shapes.
    this.setPageNumber(recPage.pageNumber)

    this.executeActions(staticActions)
  }

  /**
   * Executes a list of actions sequentially.
   * Errors during execution are caught and logged.
   *
   * @param actions The array of actions to execute.
   */
  private executeActions(actions: Action[]): void {
    for (const action of actions) {
      try {
        action.execute(this)
      }
      catch (e) {
        console.error(e)
      }
    }
  }

  /**
   * Sets the previous tool, unless the tool is atomic or undefined.
   *
   * @param tool The tool to set as the previous one.
   */
  private setPreviousTool(tool?: Tool): void {
    if (!tool) {
      return
    }

    if (tool instanceof AtomicTool) {
      // Do not remember atomic tools.
      return
    }

    this.previousTool = tool
  }
}

export { SimpleActionExecutor }
