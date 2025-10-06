import type { Recording } from '@/api/model/recording.ts'
import { FileActionParser } from '../action/parser/file-action.parser'
import { ProgressiveDataView } from '../action/parser/progressive-data-view'
import { RecordedPage } from '../model/recorded-page'

class RecordingFileHeader {
  static readonly FILE_MARKER: number = 777014354

  static readonly LENGTH: number = 48

  version: number | undefined

  duration: number | undefined

  checksum: ArrayBuffer | undefined

  actionLength: number | undefined

  audioLength: number | undefined

  documentLength: number | undefined
}

class RecordingFileReader {
  async read(file: File): Promise<Recording> {
    let start = 0
    let end = RecordingFileHeader.LENGTH
    let fileHeader: RecordingFileHeader | undefined = undefined

    type RawRecording = {
      duration?: number
      audio?: Blob
      document?: Uint8Array
      actions?: RecordedPage[]
    }

    const raw: RawRecording = {}

    return this.readHeader(file)
      .then(header => {
        fileHeader = header

        raw.duration = header.duration

        start = end
        end += fileHeader!.actionLength!

        return this.readActions(file, start, end)
      })
      .then(actions => {
        raw.actions = actions

        start = end
        end += fileHeader!.documentLength!

        return this.readDocument(file, start, end)
      })
      .then(document => {
        raw.document = document

        start = end
        end += fileHeader!.audioLength!

        return this.readAudio(file, start, end)
      })
      .then(audio => {
        raw.audio = audio

        if (
          raw.duration === undefined
          || raw.actions === undefined
          || raw.audio === undefined
          || raw.document === undefined
        ) {
          throw new Error('Incomplete recording data.')
        }

        const recording: Recording = {
          duration: raw.duration,
          actions: raw.actions,
          audio: raw.audio,
          document: raw.document,
        }

        return recording
      })
  }

  private readActions(file: File, start: number, end: number): Promise<RecordedPage[]> {
    const fileReader = new FileReader()
    const blob = file.slice(start, end)

    return new Promise((resolve, reject) => {
      fileReader.onloadend = (event) => {
        const target: FileReader | null = event.target
        if (!target) {
          reject('Invalid file reader target.')
          return
        }

        if (target.error) {
          reject(target.error)
        }
        else {
          const actionParser = new FileActionParser()
          const actions = actionParser.parse(target.result as ArrayBuffer)

          resolve(actions)
        }
      }
      fileReader.readAsArrayBuffer(blob)
    })
  }

  private readAudio(file: File, start: number, end: number): Blob {
    return file.slice(start, end)
  }

  private readDocument(file: File, start: number, end: number): Promise<Uint8Array> {
    const fileReader = new FileReader()
    const blob = file.slice(start, end)

    return new Promise((resolve, reject) => {
      fileReader.onloadend = (event) => {
        const target = event.target
        if (!target) {
          reject('Invalid file reader target.')
          return
        }

        if (target.error) {
          reject(target.error)
        }
        else {
          const documentData = new Uint8Array(target.result as ArrayBuffer)

          resolve(documentData)
        }
      }
      fileReader.readAsArrayBuffer(blob)
    })
  }

  private readHeader(file: File): Promise<RecordingFileHeader> {
    const fileReader = new FileReader()
    const blob = file.slice(0, RecordingFileHeader.LENGTH)

    return new Promise((resolve, reject) => {
      fileReader.onloadend = (event) => {
        const target = event.target
        if (!target) {
          reject('Invalid file reader target.')
          return
        }

        if (target.error) {
          reject(target.error)
        }
        else {
          const dataView = new ProgressiveDataView(target.result as ArrayBuffer)

          const marker = dataView.getInt32()

          if (marker !== RecordingFileHeader.FILE_MARKER) {
            reject('Invalid recording file header.')
            return
          }

          const header = new RecordingFileHeader()
          header.version = dataView.getInt32()
          header.duration = Number(dataView.getBigInt64())

          // Skip checksum.
          dataView.skip(20)

          header.actionLength = dataView.getInt32()
          header.documentLength = dataView.getInt32()
          header.audioLength = dataView.getInt32()

          resolve(header)
        }
      }
      fileReader.readAsArrayBuffer(blob)
    })
  }
}

export { RecordingFileHeader, RecordingFileReader }
