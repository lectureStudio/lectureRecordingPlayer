import { loadPdf, terminateWorker } from '@/services/pdfLoader'
import { usePdfStore } from '@/stores/pdf'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { EventBus } from 'pdfjs-dist/web/pdf_viewer.mjs'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the PDF loader service
vi.mock('@/services/pdfLoader', () => ({
  loadPdf: vi.fn(),
  terminateWorker: vi.fn(),
}))

// Mock PDFPageProxy
const createMockPdfPage = (pageNumber: number): PDFPageProxy => ({
  pageNumber,
  // Add other required properties as needed for testing
} as PDFPageProxy)

// Mock PDF.js types
const mockPdfDocument = {
  numPages: 10,
  getPage: vi.fn(),
} as unknown as PDFDocumentProxy

const mockEventBus = {
  on: vi.fn(),
  dispatch: vi.fn(),
} as unknown as EventBus

// Mock DOMMatrix
Object.defineProperty(global, 'DOMMatrix', {
  value: class DOMMatrix {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0

    constructor(matrix?: Partial<DOMMatrix>) {
      if (matrix) {
        Object.assign(this, matrix)
      }
    }
    static fromMatrix(matrix: Partial<DOMMatrix>) {
      const result = new DOMMatrix()
      if (matrix && typeof matrix === 'object') {
        Object.assign(result, matrix)
      }
      return result
    }
  },
  writable: true,
})

describe('stores/pdf', () => {
  let store: ReturnType<typeof usePdfStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = usePdfStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset store state
    store.clear()
  })

  describe('Initial State', () => {
    it('has correct default values', () => {
      expect(store.src).toBeNull()
      expect(store.doc).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.currentPage).toBe(1)
      expect(store.eventBus).toBeNull()
      expect(store.lastQuery).toBe('')
      expect(store.matchesTotal).toBe(0)
      expect(store.matchesCurrent).toBe(0)
      expect(store.pageTransform).toBeInstanceOf(DOMMatrix)
    })
  })

  describe('load', () => {
    it('loads PDF successfully', async () => {
      const mockSrc = 'test.pdf'
      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)

      await store.load(mockSrc)

      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.src).toBe(mockSrc)
      expect(store.doc).toBe(mockPdfDocument)
      expect(store.currentPage).toBe(1)
      expect(loadPdf).toHaveBeenCalledWith(mockSrc)
    })

    it('handles loading errors', async () => {
      const mockSrc = 'invalid.pdf'
      const mockError = new Error('Failed to load PDF')
      vi.mocked(loadPdf).mockRejectedValue(mockError)

      await store.load(mockSrc)

      expect(store.loading).toBe(false)
      expect(store.error).toBe(mockError)
      expect(store.src).toBe(mockSrc)
      expect(store.doc).toBeNull()
      expect(loadPdf).toHaveBeenCalledWith(mockSrc)
    })

    it('sets loading state during load', async () => {
      const mockSrc = 'test.pdf'
      let resolvePromise: (value: PDFDocumentProxy | PromiseLike<PDFDocumentProxy>) => void
      const loadPromise = new Promise<PDFDocumentProxy>(resolve => {
        resolvePromise = resolve
      })
      vi.mocked(loadPdf).mockReturnValue(loadPromise)

      const loadTask = store.load(mockSrc)

      expect(store.loading).toBe(true)
      expect(store.error).toBeNull()

      resolvePromise!(mockPdfDocument)
      await loadTask

      expect(store.loading).toBe(false)
    })

    it('handles different source types', async () => {
      const sources = [
        'test.pdf',
        new URL('https://example.com/test.pdf'),
        new Uint8Array([1, 2, 3, 4]),
        new ArrayBuffer(8),
      ]

      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)

      for (const src of sources) {
        await store.load(src)
        expect(store.src).toBe(src)
        expect(loadPdf).toHaveBeenCalledWith(src)
      }
    })
  })

  describe('getPage', () => {
    it('returns page when document is loaded', async () => {
      const mockPage = createMockPdfPage(1)
      vi.mocked(mockPdfDocument.getPage).mockResolvedValue(mockPage)
      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)

      await store.load('test.pdf')
      const result = await store.getPage(1)

      expect(result).toBe(mockPage)
      expect(vi.mocked(mockPdfDocument.getPage)).toHaveBeenCalledWith(1)
    })

    it('returns undefined when no document is loaded', () => {
      const result = store.getPage(1)
      expect(result).toBeUndefined()
    })
  })

  describe('setPage', () => {
    beforeEach(async () => {
      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)
      await store.load('test.pdf')
    })

    it('sets valid page number', () => {
      const result = store.setPage(5)
      expect(result).toBe(true)
      expect(store.currentPage).toBe(5)
    })

    it('does not set invalid page numbers', () => {
      const originalPage = store.currentPage

      expect(store.setPage(0)).toBe(false)
      expect(store.currentPage).toBe(originalPage)

      expect(store.setPage(-1)).toBe(false)
      expect(store.currentPage).toBe(originalPage)

      expect(store.setPage(11)).toBe(false) // Beyond numPages (10)
      expect(store.currentPage).toBe(originalPage)

      expect(store.setPage(1)).toBe(false) // Same as current page
      expect(store.currentPage).toBe(originalPage)
    })

    it('handles non-finite page numbers', () => {
      const originalPage = store.currentPage

      expect(store.setPage(NaN)).toBe(false)
      expect(store.currentPage).toBe(originalPage)

      expect(store.setPage(Infinity)).toBe(false)
      expect(store.currentPage).toBe(originalPage)

      expect(store.setPage(-Infinity)).toBe(false)
      expect(store.currentPage).toBe(originalPage)
    })

    it('handles case when no document is loaded', () => {
      store.doc = null
      const result = store.setPage(1)
      expect(result).toBe(false)
    })
  })

  describe('nextPage', () => {
    beforeEach(async () => {
      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)
      await store.load('test.pdf')
    })

    it('navigates to next page when available', () => {
      store.currentPage = 5
      const result = store.nextPage()
      expect(result).toBe(true)
      expect(store.currentPage).toBe(6)
    })

    it('does not navigate beyond last page', () => {
      store.currentPage = 10 // Last page
      const result = store.nextPage()
      expect(result).toBe(false)
      expect(store.currentPage).toBe(10)
    })
  })

  describe('prevPage', () => {
    beforeEach(async () => {
      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)
      await store.load('test.pdf')
    })

    it('navigates to previous page when available', () => {
      store.currentPage = 5
      const result = store.prevPage()
      expect(result).toBe(true)
      expect(store.currentPage).toBe(4)
    })

    it('does not navigate before first page', () => {
      store.currentPage = 1 // First page
      const result = store.prevPage()
      expect(result).toBe(false)
      expect(store.currentPage).toBe(1)
    })
  })

  describe('setEventBus', () => {
    it('sets event bus and sets up page change listener', () => {
      store.setEventBus(mockEventBus)

      expect(store.eventBus).toBe(mockEventBus)
      expect(mockEventBus.on).toHaveBeenCalledWith('pagechanging', expect.any(Function))
    })

    it('clears event bus when set to null', () => {
      store.setEventBus(mockEventBus)
      store.setEventBus(null)

      expect(store.eventBus).toBeNull()
    })

    it('handles page change events', async () => {
      // Set up document with enough pages
      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)
      await store.load('test.pdf')

      store.setEventBus(mockEventBus)
      store.currentPage = 1

      // Get the event handler
      const eventHandler = vi.mocked(mockEventBus.on).mock.calls[0]?.[1]
      expect(eventHandler).toBeDefined()

      // Simulate page change
      eventHandler!({ pageNumber: 5 })

      expect(store.currentPage).toBe(5)
    })

    it('ignores page change events without pageNumber', () => {
      store.setEventBus(mockEventBus)
      store.currentPage = 1

      const eventHandler = vi.mocked(mockEventBus.on).mock.calls[0]?.[1]
      expect(eventHandler).toBeDefined()

      // Simulate page change without pageNumber
      eventHandler!({})

      expect(store.currentPage).toBe(1)
    })
  })

  describe('setMatchesTotal', () => {
    it('sets total matches', () => {
      store.setMatchesTotal(25)
      expect(store.matchesTotal).toBe(25)
    })

    it('handles null/undefined values', () => {
      store.setMatchesTotal(null as unknown as number)
      expect(store.matchesTotal).toBe(0)

      store.setMatchesTotal(undefined as unknown as number)
      expect(store.matchesTotal).toBe(0)
    })
  })

  describe('setMatchesCurrent', () => {
    it('sets current match', () => {
      store.setMatchesCurrent(5)
      expect(store.matchesCurrent).toBe(5)
    })

    it('handles null/undefined values', () => {
      store.setMatchesCurrent(null as unknown as number)
      expect(store.matchesCurrent).toBe(0)

      store.setMatchesCurrent(undefined as unknown as number)
      expect(store.matchesCurrent).toBe(0)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      store.eventBus = mockEventBus
    })

    it('dispatches search event with correct parameters', () => {
      const query = 'test search'
      store.search(query)

      expect(store.lastQuery).toBe(query)
      expect(store.matchesTotal).toBe(0)
      expect(store.matchesCurrent).toBe(0)
      expect(mockEventBus.dispatch).toHaveBeenCalledWith('find', {
        query,
        type: 'find',
        caseSensitive: false,
        entireWord: false,
        highlightAll: true,
        findPrevious: false,
        phraseSearch: true,
        matchDiacritics: true,
      })
    })

    it('does not search with empty query', () => {
      store.search('')
      expect(mockEventBus.dispatch).not.toHaveBeenCalled()

      // Note: The current implementation doesn't trim whitespace, so this will dispatch
      store.search('   ')
      expect(mockEventBus.dispatch).toHaveBeenCalled()
    })

    it('handles case when no event bus is set', () => {
      store.eventBus = null
      expect(() => store.search('test')).not.toThrow()
    })
  })

  describe('cancelSearch', () => {
    beforeEach(() => {
      store.eventBus = mockEventBus
    })

    it('cancels search and clears state', () => {
      store.lastQuery = 'test'
      store.matchesTotal = 5
      store.matchesCurrent = 2

      store.cancelSearch()

      expect(store.lastQuery).toBe('')
      expect(store.matchesTotal).toBe(0)
      expect(store.matchesCurrent).toBe(0)
      expect(mockEventBus.dispatch).toHaveBeenCalledWith('find', {
        query: '',
        type: 'find',
        caseSensitive: false,
        entireWord: false,
        highlightAll: false,
        findPrevious: false,
        phraseSearch: true,
        matchDiacritics: true,
      })
    })

    it('does not cancel when no search is active', () => {
      store.cancelSearch()
      expect(mockEventBus.dispatch).not.toHaveBeenCalled()
    })

    it('handles case when no event bus is set', () => {
      store.eventBus = null
      expect(() => store.cancelSearch()).not.toThrow()
    })
  })

  describe('findNext', () => {
    beforeEach(() => {
      store.eventBus = mockEventBus
      store.lastQuery = 'test'
    })

    it('finds next match', () => {
      store.findNext()

      expect(mockEventBus.dispatch).toHaveBeenCalledWith('find', {
        query: 'test',
        type: 'again',
        findPrevious: false,
        highlightAll: true,
      })
    })

    it('does not find when no query is set', () => {
      store.lastQuery = ''
      store.findNext()

      expect(mockEventBus.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('findPrev', () => {
    beforeEach(() => {
      store.eventBus = mockEventBus
      store.lastQuery = 'test'
    })

    it('finds previous match', () => {
      store.findPrev()

      expect(mockEventBus.dispatch).toHaveBeenCalledWith('find', {
        query: 'test',
        type: 'again',
        findPrevious: true,
        highlightAll: true,
      })
    })

    it('does not find when no query is set', () => {
      store.lastQuery = ''
      store.findPrev()

      expect(mockEventBus.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('setPageTransform', () => {
    it('sets page transform matrix', () => {
      const transform = new DOMMatrix()
      transform.e = 10
      transform.f = 20
      store.setPageTransform(transform)

      expect(store.pageTransform).toBeInstanceOf(DOMMatrix)
      expect(store.pageTransform.a).toBe(1)
      expect(store.pageTransform.e).toBe(10)
      expect(store.pageTransform.f).toBe(20)
    })
  })

  describe('clear', () => {
    it('resets all state to initial values', async () => {
      // Set up some state
      vi.mocked(loadPdf).mockResolvedValue(mockPdfDocument)
      await store.load('test.pdf')
      store.setEventBus(mockEventBus)
      store.currentPage = 5
      store.lastQuery = 'test'
      store.matchesTotal = 10
      store.matchesCurrent = 3

      store.clear()

      expect(store.src).toBeNull()
      expect(store.doc).toBeNull()
      expect(store.eventBus).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.currentPage).toBe(1)
      expect(store.lastQuery).toBe('')
      expect(store.matchesTotal).toBe(0)
      expect(store.matchesCurrent).toBe(0)
    })
  })

  describe('dispose', () => {
    it('clears state and terminates worker', () => {
      store.dispose()

      expect(store.src).toBeNull()
      expect(store.doc).toBeNull()
      expect(terminateWorker).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles very large page numbers', async () => {
      const largeDoc = { ...mockPdfDocument, numPages: 1000000 } as PDFDocumentProxy
      vi.mocked(loadPdf).mockResolvedValue(largeDoc)
      await store.load('test.pdf')

      expect(store.setPage(1000000)).toBe(true)
      expect(store.setPage(1000001)).toBe(false)
    })

    it('handles zero-page documents', async () => {
      const zeroDoc = { ...mockPdfDocument, numPages: 0 } as PDFDocumentProxy
      vi.mocked(loadPdf).mockResolvedValue(zeroDoc)
      await store.load('test.pdf')

      expect(store.setPage(1)).toBe(false)
      expect(store.nextPage()).toBe(false)
      expect(store.prevPage()).toBe(false)
    })

    it('handles concurrent load operations', async () => {
      const promise1 = store.load('test1.pdf')
      const promise2 = store.load('test2.pdf')

      vi.mocked(loadPdf).mockResolvedValueOnce(mockPdfDocument)
      vi.mocked(loadPdf).mockResolvedValueOnce({ ...mockPdfDocument, numPages: 5 } as PDFDocumentProxy)

      await Promise.all([promise1, promise2])

      // The last load should win
      expect(store.src).toBe('test2.pdf')
    })
  })
})
