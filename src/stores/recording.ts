import { Page } from '@/api/model/page.ts'
import { RecordedPage } from '@/api/model/recorded-page.ts'
import type { Recording } from '@/api/model/recording.ts'
import { defineStore } from 'pinia'
import { markRaw } from 'vue'

export const useRecordingStore = defineStore('recording', {
  state: () => ({
    audio: undefined as Blob | undefined,
    document: undefined as Uint8Array | undefined,
    actions: [] as RecordedPage[],
    pages: [] as Page[],
  }),
  actions: {
    setRecording(recording: Recording) {
      this.audio = recording.audio
      this.document = recording.document
      this.actions = recording.actions
      this.pages = markRaw([] as Page[])

      const count = this.actions?.length ?? 0
      for (let i = 0; i < count; i++) {
        this.pages.push(markRaw(new Page(i)))
      }
    },
    getPageCount(): number {
      return this.pages ? this.pages.length : 0
    },
    getPage(pageNumber: number): Page {
      if (!this.pages) {
        throw new Error('Pages not loaded.')
      }
      if (pageNumber < 0 || pageNumber > this.pages.length - 1) {
        throw new Error(`Page number ${pageNumber} out of bounds.`)
      }
      return this.pages[pageNumber] as Page
    },
  },
})
