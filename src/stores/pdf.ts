import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { TypedArray } from 'pdfjs-dist/types/src/display/api'
import type { EventBus } from 'pdfjs-dist/web/pdf_viewer.mjs'
import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import { loadPdf, terminateWorker } from '../services/pdfLoader'

export const usePdfStore = defineStore('pdf', {
  state: () => ({
    src: null as string | URL | TypedArray | ArrayBuffer | null,
    doc: null as PDFDocumentProxy | null,
    loading: false,
    error: null as unknown | null,
    currentPage: 1,
    // Event bus from pdfjs viewer; used to dispatch find events
    eventBus: null as EventBus | null,
    lastQuery: '' as string,
    matchesTotal: 0 as number,
    matchesCurrent: 0 as number,
    pageTransform: new DOMMatrix() as DOMMatrix,
  }),
  getters: {
    /**
     * Returns the total number of pages in the loaded PDF document.
     *
     * @param state - The store state object.
     *
     * @returns The number of pages in the document, or 0 if no document is loaded.
     */
    pageCount(state): number {
      return state.doc?.numPages ?? 0
    },
  },
  actions: {
    /**
     * Loads a PDF document from the given source URL or file path.
     * Sets the loading state while the PDF is being loaded and handles any errors that occur.
     * Upon successful load, sets the current page to 1.
     *
     * @param src - The source URL or file path of the PDF to load.
     *
     * @throws Will set the error state if the PDF fails to load.
     */
    async load(src: string | URL | TypedArray | ArrayBuffer) {
      this.loading = true
      this.error = null
      this.src = src

      try {
        this.doc = markRaw(await loadPdf(src))
        this.currentPage = 1
      }
      catch (e) {
        this.error = e
        this.doc = null
      }
      finally {
        this.loading = false
      }
    },
    /**
     * Retrieves a specific page from the loaded PDF document.
     *
     * @param page - The page number to retrieve (1-based index).
     *
     * @returns A promise that resolves to the PDF page object, or undefined if no document is loaded.
     */
    getPage(page: number) {
      return this.doc?.getPage(page)
    },
    /**
     * Sets the current page number in the store.
     *
     * @param page - The page number to set as current (1-based index).
     *
     * @returns True if the page number is valid and within the document bounds.
     */
    setPage(page: number) {
      const numPages = this.doc?.numPages ?? 0

      if (numPages <= 0 || !Number.isFinite(page) || page === 0) {
        return false
      }
      if (page < 1 || page > numPages || page === this.currentPage) {
        return false
      }

      this.currentPage = page

      return true
    },
    /**
     * Navigates to the next page in the PDF document.
     * Increments the current page number by 1 if a next page exists.
     *
     * @returns True if navigation was successful.
     */
    nextPage(): boolean {
      return this.setPage(this.currentPage + 1)
    },
    /**
     * Navigates to the previous page in the PDF document.
     * Decrements the current page number by 1 if a previous page exists.
     *
     * @returns True if navigation was successful.
     */
    prevPage(): boolean {
      return this.setPage(this.currentPage - 1)
    },
    /**
     * Sets the PDF.js event bus instance for dispatching viewer events.
     * The event bus is stored as a non-reactive reference to prevent Vue reactivity issues.
     *
     * @param bus - The PDF.js EventBus instance, or null to clear the current bus.
     */
    setEventBus(bus: EventBus | null) {
      // store a non-reactive reference
      this.eventBus = bus ? markRaw(bus) : null

      if (this.eventBus) {
        // Keep the store's currentPage in sync
        this.eventBus.on('pagechanging', ({ pageNumber }: { pageNumber?: number }) => {
          if (pageNumber) {
            this.setPage(pageNumber)
          }
        })
      }
    },
    /**
     * Sets the total number of search matches found in the document.
     *
     * @param total - The total count of matches, defaults to 0 if null/undefined.
     */
    setMatchesTotal(total: number) {
      this.matchesTotal = total ?? 0
    },
    /**
     * Sets the current match index in the search results.
     *
     * @param current - The current match index, defaults to 0 if null/undefined.
     */
    setMatchesCurrent(current: number) {
      this.matchesCurrent = current ?? 0
    },
    /**
     * Initiates a search for the specified query in the PDF document.
     * Resets match counters and dispatches a find event to the PDF viewer.
     *
     * @param query - The text string to search for in the document.
     */
    search(query: string) {
      if (!query) {
        return
      }
      this.lastQuery = query
      this.matchesTotal = 0
      this.matchesCurrent = 0
      this.eventBus?.dispatch('find', {
        query,
        type: 'find',
        caseSensitive: false,
        entireWord: false,
        highlightAll: true,
        findPrevious: false,
        phraseSearch: true,
        matchDiacritics: true,
      })
    },
    /**
     * Cancels the current search operation and clears all search highlights.
     * Resets the search state including query, match counters, and removes
     * visual highlights from the PDF viewer.
     */
    cancelSearch() {
      if (!this.lastQuery && this.matchesTotal === 0 && this.matchesCurrent === 0) {
        return
      }
      // Dispatch an empty find query to clear highlights in the viewer
      this.eventBus?.dispatch('find', {
        query: '',
        type: 'find',
        caseSensitive: false,
        entireWord: false,
        highlightAll: false,
        findPrevious: false,
        phraseSearch: true,
        matchDiacritics: true,
      })
      this.lastQuery = ''
      this.matchesTotal = 0
      this.matchesCurrent = 0
    },
    /**
     * Navigates to the next search match in the PDF document.
     * Dispatches a find event with type 'again' to move to the subsequent occurrence
     * of the current search query. Does nothing if no search query is active.
     */
    findNext() {
      if (!this.lastQuery) {
        return
      }
      this.eventBus?.dispatch('find', {
        query: this.lastQuery,
        type: 'again',
        findPrevious: false,
        highlightAll: true,
      })
    },
    /**
     * Navigates to the previous search match in the PDF document.
     * Dispatches a find event with type 'again' to move to the preceding occurrence
     * of the current search query. Does nothing if no search query is active.
     */
    findPrev() {
      if (!this.lastQuery) {
        return
      }
      this.eventBus?.dispatch('find', {
        query: this.lastQuery,
        type: 'again',
        findPrevious: true,
        highlightAll: true,
      })
    },
    /**
     * Sets the page transform matrix.
     *
     * @param transform - The DOMMatrix to apply to the page.
     */
    setPageTransform(transform: DOMMatrix) {
      this.pageTransform = markRaw(DOMMatrix.fromMatrix(transform))
    },
    /**
     * Clears all PDF-related state in the store.
     * Resets the document, source, loading state, error state, current page,
     * and search-related properties to their initial values.
     */
    clear() {
      this.src = null
      this.doc = null
      this.eventBus = null
      this.loading = false
      this.error = null
      this.currentPage = 1
      this.lastQuery = ''
      this.matchesTotal = 0
      this.matchesCurrent = 0
    },
    /**
     * Disposes of the PDF store and cleans up all resources.
     * Clears all state and terminates the PDF.js worker to free up memory.
     * This should be called when the store is no longer needed.
     */
    dispose() {
      this.clear()
      terminateWorker()
    },
  },
})
