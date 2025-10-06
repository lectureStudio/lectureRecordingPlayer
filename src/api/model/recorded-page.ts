import { Action } from '../action/action'

class RecordedPage {
  staticActions: Action[] = []

  playbackActions: Action[] = []

  pageNumber: number = 0

  timestamp: number = 0
}

export { RecordedPage }
