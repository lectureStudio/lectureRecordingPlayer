import { Page } from '@/api/model/page'
import type { RecordedPage } from '@/api/model/recorded-page'
import type { Recording } from '@/api/model/recording'
import { useRecordingStore } from '@/stores/recording'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Page class
vi.mock('@/api/model/page', () => ({
  Page: vi.fn().mockImplementation((pageNumber: number) => ({
    pageNumber,
    getPageNumber: vi.fn().mockReturnValue(pageNumber),
    // Add other properties as needed for testing
  })),
}))

describe('stores/recording', () => {
  let store: ReturnType<typeof useRecordingStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRecordingStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset store state
    store.$patch({
      audio: undefined,
      document: undefined,
      actions: [],
      pages: [],
    })
  })

  describe('Initial State', () => {
    it('has correct default values', () => {
      expect(store.audio).toBeUndefined()
      expect(store.document).toBeUndefined()
      expect(store.actions).toEqual([])
      expect(store.pages).toEqual([])
    })
  })

  describe('setRecording', () => {
    it('sets recording data correctly', () => {
      const mockAudio = new Blob(['audio data'], { type: 'audio/wav' })
      const mockDocument = new Uint8Array([1, 2, 3, 4])
      const mockActions: RecordedPage[] = [
        { pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 1, staticActions: [], playbackActions: [], timestamp: 0 },
      ]

      const mockRecording: Recording = {
        audio: mockAudio,
        document: mockDocument,
        actions: mockActions,
        duration: 100,
      }

      store.setRecording(mockRecording)

      expect(store.audio).toBe(mockAudio)
      expect(store.document).toBe(mockDocument)
      expect(store.actions).toStrictEqual(mockActions)
      expect(store.pages).toHaveLength(2)
    })

    it('creates Page instances for each action', () => {
      const mockActions: RecordedPage[] = [
        { pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 1, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 2, staticActions: [], playbackActions: [], timestamp: 0 },
      ]

      const mockRecording: Recording = {
        audio: new Blob(),
        document: new Uint8Array(),
        actions: mockActions,
        duration: 100,
      }

      store.setRecording(mockRecording)

      expect(store.pages).toHaveLength(3)
      expect(Page).toHaveBeenCalledTimes(3)
      expect(Page).toHaveBeenCalledWith(0)
      expect(Page).toHaveBeenCalledWith(1)
      expect(Page).toHaveBeenCalledWith(2)
    })

    it('handles empty actions array', () => {
      const mockRecording: Recording = {
        audio: new Blob(),
        document: new Uint8Array(),
        actions: [],
        duration: 100,
      }

      store.setRecording(mockRecording)

      expect(store.actions).toEqual([])
      expect(store.pages).toEqual([])
      expect(Page).not.toHaveBeenCalled()
    })

    it('handles undefined actions', () => {
      const mockRecording: Recording = {
        audio: new Blob(),
        document: new Uint8Array(),
        actions: undefined as unknown as RecordedPage[],
        duration: 100,
      }

      store.setRecording(mockRecording)

      expect(store.actions).toBeUndefined()
      expect(store.pages).toEqual([])
      expect(Page).not.toHaveBeenCalled()
    })

    it('overwrites previous recording data', () => {
      const firstRecording: Recording = {
        audio: new Blob(['first'], { type: 'audio/wav' }),
        document: new Uint8Array([1, 2]),
        actions: [{ pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 }],
        duration: 100,
      }

      const secondRecording: Recording = {
        audio: new Blob(['second'], { type: 'audio/wav' }),
        document: new Uint8Array([3, 4, 5]),
        actions: [
          { pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 },
          { pageNumber: 1, staticActions: [], playbackActions: [], timestamp: 0 },
        ],
        duration: 100,
      }

      store.setRecording(firstRecording)
      expect(store.pages).toHaveLength(1)

      store.setRecording(secondRecording)
      expect(store.pages).toHaveLength(2)
      expect(store.audio).toBe(secondRecording.audio)
      expect(store.document).toBe(secondRecording.document)
    })
  })

  describe('getPageCount', () => {
    it('returns 0 when no pages are loaded', () => {
      expect(store.getPageCount()).toBe(0)
    })

    it('returns correct count when pages are loaded', () => {
      const mockActions: RecordedPage[] = [
        { pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 1, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 2, staticActions: [], playbackActions: [], timestamp: 0 },
      ]

      store.setRecording({
        audio: new Blob(),
        document: new Uint8Array(),
        actions: mockActions,
        duration: 100,
      })

      expect(store.getPageCount()).toBe(3)
    })

    it('returns 0 when pages is undefined', () => {
      store.$patch({ pages: undefined as unknown as Page[] })
      expect(store.getPageCount()).toBe(0)
    })
  })

  describe('getPage', () => {
    beforeEach(() => {
      const mockActions: RecordedPage[] = [
        { pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 1, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 2, staticActions: [], playbackActions: [], timestamp: 0 },
      ]

      store.setRecording({
        audio: new Blob(),
        document: new Uint8Array(),
        actions: mockActions,
        duration: 100,
      })
    })

    it('returns correct page for valid page number', () => {
      const page = store.getPage(1)
      expect(page).toBeDefined()
      expect(page.getPageNumber()).toBe(1)
    })

    it('returns first page for page number 0', () => {
      const page = store.getPage(0)
      expect(page).toBeDefined()
      expect(page.getPageNumber()).toBe(0)
    })

    it('returns last page for highest valid page number', () => {
      const page = store.getPage(2)
      expect(page).toBeDefined()
      expect(page.getPageNumber()).toBe(2)
    })

    it('throws error for negative page number', () => {
      expect(() => store.getPage(-1)).toThrow('Page number -1 out of bounds.')
    })

    it('throws error for page number greater than available pages', () => {
      expect(() => store.getPage(3)).toThrow('Page number 3 out of bounds.')
    })

    it('throws error when pages are not loaded', () => {
      store.$patch({ pages: undefined as unknown as Page[] })
      expect(() => store.getPage(0)).toThrow('Pages not loaded.')
    })

    it('handles non-integer page numbers', () => {
      // First set up the recording with some pages
      const mockActions: RecordedPage[] = [
        { pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 1, staticActions: [], playbackActions: [], timestamp: 0 },
        { pageNumber: 2, staticActions: [], playbackActions: [], timestamp: 0 },
      ]
      const mockRecording: Recording = {
        audio: new Blob(),
        document: new Uint8Array(),
        actions: mockActions,
        duration: 100,
      }
      store.setRecording(mockRecording)

      // The store doesn't specifically validate for integers, just bounds
      // 1.5 is within bounds (0 to 2), but array access with non-integer index returns undefined
      const page = store.getPage(1.5)
      expect(page).toBeUndefined() // Array access with non-integer index returns undefined
    })
  })

  describe('Edge Cases', () => {
    it('handles recording with null values', () => {
      const mockRecording: Recording = {
        audio: null as unknown as Blob,
        document: null as unknown as Uint8Array,
        actions: null as unknown as RecordedPage[],
        duration: 100,
      }

      expect(() => store.setRecording(mockRecording)).not.toThrow()
      expect(store.audio).toBeNull()
      expect(store.document).toBeNull()
      expect(store.actions).toBeNull()
    })

    it('handles very large number of pages', () => {
      const mockActions: RecordedPage[] = Array.from({ length: 1000 }, (_, i) => ({
        pageNumber: i,
        staticActions: [],
        playbackActions: [],
        timestamp: 0,
      }))

      const mockRecording: Recording = {
        audio: new Blob(),
        document: new Uint8Array(),
        actions: mockActions,
        duration: 100,
      }

      store.setRecording(mockRecording)
      expect(store.getPageCount()).toBe(1000)
      expect(store.getPage(999)).toBeDefined()
    })

    it('maintains page references after multiple setRecording calls', () => {
      const firstRecording: Recording = {
        audio: new Blob(),
        document: new Uint8Array(),
        actions: [{ pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 }],
        duration: 100,
      }

      store.setRecording(firstRecording)
      const firstPage = store.getPage(0)

      const secondRecording: Recording = {
        audio: new Blob(),
        document: new Uint8Array(),
        actions: [
          { pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 },
          { pageNumber: 1, staticActions: [], playbackActions: [], timestamp: 0 },
        ],
        duration: 100,
      }

      store.setRecording(secondRecording)
      const secondPage = store.getPage(0)

      // Pages should be new instances
      expect(firstPage).not.toBe(secondPage)
    })
  })
})
