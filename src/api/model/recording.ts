import { RecordedPage } from './recorded-page'

/**
 * Represents a recording with its associated data.
 */
type Recording = {
  /** Duration of the recording in milliseconds. */
  duration: number

  /** Audio blob data of the recording. */
  audio: Blob

  /** Document data stored as a byte array. */
  document: Uint8Array

  /** List of recorded page actions. */
  actions: RecordedPage[]
}

export type { Recording }
