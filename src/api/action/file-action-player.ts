import { Rectangle } from '../geometry/rectangle'
import { SlideDocument } from '../model/document'
import { RecordedPage } from '../model/recorded-page'
import { RenderController } from '../render/render-controller'
import { ExecutableState } from '../utils/executable-state'
import { Action } from './action'
import { ActionPlayer } from './action-player'
import { FileActionExecutor } from './file-action-executor'
import { PageAction } from './page.action'
import { SimpleActionExecutor } from './simple-action-executor'

/**
 * Manages the playback of recorded actions for slide presentations.
 * Handles page navigation, action execution, and synchronization with audio.
 *
 * @extends ActionPlayer
 */
class FileActionPlayer extends ActionPlayer {
  /** The slide document containing pages that actions will be executed on */
  private readonly document: SlideDocument

  /** Executor for simple actions that don't require rendering updates */
  private readonly simpleExecutor: SimpleActionExecutor

  /** Collection of pages with recorded actions */
  private recordedPages: RecordedPage[] = []

  /** Maps page numbers to their corresponding timestamps */
  private pageChangeActions: Map<number, number> = new Map()

  /** Stack of actions to be executed */
  private actions: Action[] = []

  /** The current page being displayed */
  private pageNumber: number | undefined

  /** ID for the animation frame request */
  private requestID: number | undefined

  /** Audio element for synchronizing actions with audio playback */
  private audioElement: HTMLAudioElement | undefined

  /**
   * Creates a new FileActionPlayer.
   *
   * @param document - The slide document to operate on
   * @param renderController - Controller for rendering updates to the UI
   */
  constructor(document: SlideDocument, renderController: RenderController) {
    super(new FileActionExecutor(document, renderController))

    this.document = document
    this.simpleExecutor = new SimpleActionExecutor(document)
  }

  /**
   * Sets the audio element for synchronizing actions with audio playback.
   *
   * @param audio - HTML audio element to sync with
   */
  public setAudioElement(audio: HTMLAudioElement): void {
    this.audioElement = audio
  }

  /**
   * Sets the collection of recorded pages with actions.
   *
   * @param recordedPages - Array of recorded pages with their actions
   */
  public setRecordedPages(recordedPages: RecordedPage[]): void {
    this.recordedPages = recordedPages
  }

  /**
   * Seeks to a specific time in the presentation.
   *
   * @param time - Time in milliseconds
   *
   * @returns The page number that corresponds to the provided time
   */
  public seekByTime(time: number): number {
    const pageNumber = this.getTimeTablePage(time)

    this.seek(pageNumber, time)

    return pageNumber
  }

  /**
   * Seeks to a specific page in the presentation.
   *
   * @param pageNumber - The page number to seek to
   *
   * @returns The timestamp of the page, or -1 if page not found
   */
  public seekByPage(pageNumber: number): number {
    if (pageNumber === this.pageNumber || pageNumber < 0 || pageNumber >= this.recordedPages.length) {
      return -1
    }

    const timestamp = this.pageChangeActions.get(pageNumber)

    if (timestamp == null) {
      return -1
    }

    this.seek(pageNumber, timestamp)

    return timestamp
  }

  /**
   * Navigates to the previous page in the presentation.
   *
   * @returns The timestamp of the previous page, or -1 if there is no previous page
   */
  public selectPreviousPage(): number {
    if (this.pageNumber == null || this.pageNumber <= 0 || this.recordedPages.length < 1) {
      return -1
    }

    return this.seekByPage(this.pageNumber - 1)
  }

  /**
   * Navigates to the next page in the presentation.
   *
   * @returns The timestamp of the next page, or -1 if there is no next page
   */
  public selectNextPage(): number {
    if (this.pageNumber == null || this.pageNumber >= this.recordedPages.length - 1 || this.recordedPages.length < 1) {
      return -1
    }

    return this.seekByPage(this.pageNumber + 1)
  }

  protected initInternal(): void {
    this.pageNumber = 0
    this.actions = []
    this.pageChangeActions = new Map()

    for (const recPage of this.recordedPages) {
      this.pageChangeActions.set(recPage.pageNumber, recPage.timestamp)

      this.resetPage(recPage.pageNumber)
    }

    this.getPlaybackActions(this.pageNumber)

    this.executor.setPageNumber(this.pageNumber)
  }

  protected startInternal(): void {
    try {
      this.run()
    }
    catch (e) {
      console.error(e)

      throw new Error('Execute action failed.')
    }
  }

  protected stopInternal(): void {
    if (this.requestID) {
      cancelAnimationFrame(this.requestID)
    }

    this.reset()
    this.seekByPage(0)
  }

  protected suspendInternal(): void {
    if (this.requestID) {
      cancelAnimationFrame(this.requestID)
    }
  }

  protected destroyInternal(): void {
    this.actions.length = 0
    this.pageChangeActions.clear()
  }

  protected executeActions(): void {
    let execute = true

    while (execute) {
      const state = this.state

      if (state === ExecutableState.Starting || state === ExecutableState.Started) {
        const time = this.audioElement ? this.audioElement.currentTime * 1000 : 0
        let actionCount = this.actions.length

        if (actionCount > 0) {
          // Get the next action for execution.
          const action = this.actions[actionCount - 1]

          if (action && time >= action.timestamp) {
            // console.log("execute", Math.ceil(Math.abs(time - action.timestamp)), action.constructor.name,);
            action.execute(this.executor)

            // Remove the executed action.
            this.actions.pop()

            actionCount = this.actions.length
          }
          else {
            execute = false
          }
        }
        else if (this.pageNumber !== undefined && this.pageNumber < this.recordedPages.length - 1) {
          // Get actions for the next page.
          this.getPlaybackActions(++this.pageNumber)
        }
        else {
          execute = false
        }
      }
      else {
        execute = false
      }
    }
  }

  private run() {
    try {
      this.executeActions()
    }
    catch (e) {
      console.error(e)
    }

    this.requestID = requestAnimationFrame(this.run.bind(this))
  }

  private getPlaybackActions(pageNumber: number): void {
    const recPage = this.recordedPages[pageNumber]

    if (!recPage) {
      throw new Error('Recorded page not found')
    }

    // Add page change action.
    const action = new PageAction(pageNumber)
    action.timestamp = recPage.timestamp

    this.actions.length = 0
    this.actions.push(action)
    this.actions.push(...recPage.playbackActions)

    if (this.actions.length > 1) {
      this.actions.reverse()
    }

    this.pageNumber = pageNumber
  }

  private getTimeTablePage(seekTime: number): number {
    let page = 0

    for (const [pageNumber, timestamp] of this.pageChangeActions) {
      if (seekTime == timestamp) {
        page = pageNumber
        break
      }
      else if (seekTime < timestamp) {
        break
      }
      page = pageNumber
    }

    return page
  }

  private seek(pageNumber: number, time: number): void {
    // console.log('seek', pageNumber, time)

    this.executor.setSeek(true)

    this.resetPages(pageNumber, this.pageNumber)

    const recPage = this.recordedPages[pageNumber]

    if (recPage && recPage.pageNumber === pageNumber) {
      this.getPlaybackActions(pageNumber)

      let actionCount = this.actions.length

      // Find actions for execution on the given page.
      while (actionCount > 0) {
        const action = this.actions[actionCount - 1]

        if (action && time >= action.timestamp) {
          try {
            action.execute(this.executor)
          }
          catch (e) {
            console.error(e)
          }

          this.actions.pop()

          actionCount = this.actions.length
        }
        else {
          // Nothing more to execute.
          break
        }
      }
    }

    this.executor.setSeek(false)
  }

  private reset(): void {
    this.executor.setSeek(true)
    this.resetPages(0, this.pageNumber)
    this.executor.setSeek(false)
  }

  private resetPages(newPage: number, previousPage: number | undefined): void {
    if (!previousPage) {
      return
    }

    if (newPage === previousPage) {
      this.resetPage(newPage)
    }
    else if (newPage < previousPage) {
      let resetPage = newPage

      while (resetPage <= previousPage) {
        this.resetPage(resetPage++)
      }
    }
  }

  private resetPage(pageNumber: number): void {
    const page = this.document.getPage(pageNumber)

    if (!page) {
      throw new Error('Page not found')
    }
    if (page.hasShapes()) {
      page.clear()
    }

    this.loadStaticShapes(this.recordedPages[pageNumber])

    page.getSlideShape().setPageRect(new Rectangle(0, 0, 1, 1))
  }

  private loadStaticShapes(recPage: RecordedPage | undefined): void {
    if (!recPage) {
      return
    }

    const staticActions = recPage.staticActions
    const actionCount = staticActions.length

    if (actionCount < 1) {
      return
    }

    // Select the page to which to add static shapes.
    this.simpleExecutor.setPageNumber(recPage.pageNumber)

    for (const action of staticActions) {
      try {
        action.execute(this.simpleExecutor)
      }
      catch (e) {
        console.error(e)
      }
    }
  }
}

export { FileActionPlayer }
