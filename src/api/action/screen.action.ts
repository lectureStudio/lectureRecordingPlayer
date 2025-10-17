import { Action } from './action'
import type { ActionExecutor } from './action-executor'

class ScreenAction extends Action {
  readonly videoOffset: number
  readonly videoLength: number
  readonly contentWidth: number
  readonly contentHeight: number
  readonly fileName: string

  constructor(videoOffset: number, videoLength: number, contentWidth: number, contentHeight: number, fileName: string) {
    super()

    this.videoOffset = videoOffset
    this.videoLength = videoLength
    this.contentWidth = contentWidth
    this.contentHeight = contentHeight
    this.fileName = fileName
  }

  execute(executor: ActionExecutor): void {
    executor.playVideo(
      this.timestamp,
      this.videoOffset,
      this.videoLength,
      this.contentWidth,
      this.contentHeight,
      this.fileName,
    )
  }
}

export { ScreenAction }
