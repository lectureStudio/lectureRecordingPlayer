import { usePdfStore } from '@/stores/pdf'
import { PenPoint } from '../geometry/pen-point'
import { SlideDocument } from '../model/document'
import { RenderController } from '../render/render-controller'
import { AtomicTool } from '../tool/atomic.tool'
import type { Tool } from '../tool/tool'
import { ToolContext } from '../tool/tool-context'
import type { ActionExecutor } from './action-executor'

class FileActionExecutor implements ActionExecutor {
  private readonly document: SlideDocument

  private readonly renderController: RenderController

  private readonly toolContext: ToolContext

  private readonly pdfStore: ReturnType<typeof usePdfStore>

  private tool: Tool | undefined

  private previousTool: Tool | undefined

  private pageNumber: number | undefined

  private pageIndexObserver: ((value: number) => void) | undefined

  constructor(document: SlideDocument, renderController: RenderController) {
    this.document = document
    this.renderController = renderController
    this.toolContext = new ToolContext(renderController)
    this.pdfStore = usePdfStore()
  }

  setOnSelectPageIndex(observer: (value: number) => void): void {
    this.pageIndexObserver = observer
  }

  setKeyEvent(keyEvent: KeyboardEvent): void {
    this.toolContext.keyEvent = keyEvent
  }

  setSeek(seek: boolean): void {
    this.renderController.setSeek(seek)
  }

  setPageNumber(pageNumber: number) {
    if (this.pageNumber === pageNumber) {
      return
    }

    const page = this.document.getPage(pageNumber)

    if (!page) {
      throw new Error('Page not found')
    }

    this.pageNumber = pageNumber
    this.toolContext.page = page

    this.renderController.setPage(page)

    // Keep the PDF store's currentPage in sync with executor changes
    this.pdfStore.setPage(pageNumber + 1)

    if (this.pageIndexObserver) {
      this.pageIndexObserver(pageNumber)
    }
  }

  setTool(tool: Tool): void {
    if (!tool) {
      throw new Error('Tool must not be null')
    }
    if (this.tool && this.tool === tool) {
      return
    }

    this.setPreviousTool(this.tool)

    this.tool = tool
  }

  selectAndExecuteTool(tool: AtomicTool): void {
    this.executeAtomicTool(tool)
  }

  beginTool(point: PenPoint): void {
    if (this.tool) {
      this.tool.begin(point.clone(), this.toolContext)
    }
  }

  executeTool(point: PenPoint): void {
    if (this.tool) {
      this.tool.execute(point.clone())
    }
  }

  endTool(point: PenPoint): void {
    if (this.tool) {
      this.tool.end(point.clone())
    }
  }

  playVideo(
    startTimestamp: number,
    videoOffset: number,
    videoLength: number,
    contentWidth: number,
    contentHeight: number,
    fileName: string,
  ): void {
    this.renderController.playVideo(startTimestamp, videoOffset, videoLength, contentWidth, contentHeight, fileName)
  }

  stopVideo(): void {
    this.renderController.stopVideo()
  }

  private executeAtomicTool(tool: AtomicTool): void {
    const point = PenPoint.createZero()

    this.setTool(tool)

    this.beginTool(point)
    this.executeTool(point)
    this.endTool(point)

    this.setPreviousTool(this.previousTool)
  }

  private setPreviousTool(tool: Tool | undefined): void {
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

export { FileActionExecutor }
