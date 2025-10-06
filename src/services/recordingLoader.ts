import { RecordingFileReader } from '@/api/io/recording-file-reader.ts'
import type { Recording } from '@/api/model/recording.ts'

/**
 * Loads a recording from a file and returns a hydrated Recording object.
 *
 * This function takes a file containing a serialized recording, reads and parses it
 * using RecordingFileReader, loads the embedded document, and creates a fully
 * populated Recording instance.
 *
 * @param file - The file containing the serialized recording data.
 *
 * @returns A Promise that resolves to a fully hydrated Recording object.
 *
 * @throws Will reject the promise if the recording file is invalid.
 */
export function loadRecording(file: File): Promise<Recording> {
  return new Promise((resolve, reject) => {
    const recordingReader = new RecordingFileReader()
    const promise = recordingReader.read(file)
    promise.then((recording: Recording) => {
      if (!recording.document || !recording.actions || !recording.audio) {
        reject('Invalid recording file')
        return
      }

      resolve(recording)
    })
    promise.catch((error) => {
      reject(error)
    })
  })
}
