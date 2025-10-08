<script setup lang="ts">
import { useKeyboard } from '@/composables/useKeyboard'
import { usePlayerControls } from '@/composables/usePlayerControls'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import {
  EventBus,
  PDFFindController,
  PDFLinkService,
  PDFPageView,
  PDFSinglePageViewer,
} from 'pdfjs-dist/web/pdf_viewer.mjs'
import { computed, type Ref } from 'vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePdfStore } from '../stores/pdf'

/**
 * PDF store that manages the current PDF document and page state.
 */
const pdfStore = usePdfStore()

const { selectPrevPage, selectNextPage, setupPdfPageSync } = usePlayerControls()

/**
 * Computed property that indicates whether PDF navigation is possible.
 * Returns true when a PDF document is loaded in the store.
 */
const canNavigate = computed(() => !!pdfStore.doc)

/**
 * Reference to the container element that holds the PDF viewer.
 */
const containerRef: Ref<HTMLDivElement | null> = ref(null)

/**
 * Reference to the viewer DOM element where PDF pages are rendered.
 */
const viewerRef: Ref<HTMLDivElement | null> = ref(null)

const isRendering = ref(false)
const currentRenderingPage = ref<number | null>(null)

/**
 * Event bus for PDF viewer events communication.
 */
let eventBus: EventBus | null = null

/**
 * PDF link service to handle internal links/navigation.
 */
let linkService: PDFLinkService | null = null

/**
 * Find-controller to enable text search/highlighting.
 */
let findController: PDFFindController | null = null

/**
 * Single page PDF viewer instance that handles rendering.
 */
let singlePageViewer: PDFSinglePageViewer | null = null

/**
 * Resize observer to handle container size changes.
 */
let resizeObs: ResizeObserver | null = null

/**
 * Initializes the PDF viewer component.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 */
async function initViewer(): Promise<void> {
  await nextTick()

  if (!containerRef.value) {
    return
  }
  if (!eventBus) {
    eventBus = new EventBus()
    // Expose eventBus to the store so other components (like NavigationBar) can trigger find
    pdfStore.setEventBus(eventBus)
  }

  if (!linkService) {
    linkService = new PDFLinkService({ eventBus: eventBus! })
  }
  if (!findController) {
    findController = new PDFFindController({
      eventBus: eventBus!,
      linkService: linkService!,
    })
  }

  if (!singlePageViewer) {
    singlePageViewer = new PDFSinglePageViewer({
      container: containerRef.value,
      viewer: viewerRef.value || undefined,
      eventBus: eventBus!,
      linkService: linkService!,
      findController: findController!,
      textLayerMode: 1, // Enable the text layer for search highlighting
    })

    // Connect services to the viewer
    linkService.setViewer(singlePageViewer)

    // Listen for search results count updates to reflect in UI
    eventBus.on(
      'updatefindmatchescount',
      (
        { matchesCount }: {
          matchesCount?: { total?: number; current?: number }
        },
      ) => {
        pdfStore.setMatchesTotal(matchesCount?.total ?? 0)
        pdfStore.setMatchesCurrent(matchesCount?.current ?? 0)
      },
    )

    // Listen for control state changes (e.g., selection changed to next/prev match)
    eventBus.on(
      'updatefindcontrolstate',
      (
        { matchesCount }: {
          matchesCount?: { total?: number; current?: number }
        },
      ) => {
        pdfStore.setMatchesCurrent(matchesCount?.current ?? 0)
        pdfStore.setMatchesTotal(matchesCount?.total ?? 0)
      },
    )

    eventBus.on('pagesinit', () => {
      if (singlePageViewer) {
        // Fit the page to the container and ensure the correct page is shown initially
        singlePageViewer.currentScaleValue = 'page-fit'
        // Ensure the correct page number is displayed using store
        singlePageViewer.currentPageNumber = pdfStore.currentPage
      }
    })

    eventBus.on(
      'pagerender',
      (
        { pageNumber }: {
          pageNumber: number
        },
      ) => {
        isRendering.value = true
        currentRenderingPage.value = pageNumber

        const pageView: PDFPageView = singlePageViewer?.getPageView(
          pageNumber - 1,
        )
        if (!pageView) {
          return
        }

        const pdfPage = pageView.pdfPage

        if (pageView && pageView.canvas) {
          const canvas = pageView.canvas as HTMLCanvasElement
          const ctx = canvas.getContext('2d')

          if (ctx && pdfPage) {
            const { pageTransform } = pdfStore
            if (pageTransform) {
              ctx.setTransform(pageTransform)
            }
          }
        }
      },
    )

    eventBus.on('pagerendered', (evt: { pageNumber: number }) => {
      if (currentRenderingPage.value === evt.pageNumber) {
        isRendering.value = false
        currentRenderingPage.value = null
      }
    })
  }
}

/**
 * Applies the current PDF document from the store to the PDF viewer.
 * Initializes the viewer first and then sets the document.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the document has been applied.
 */
async function applyDocument(): Promise<void> {
  await initViewer()
  const doc = pdfStore.doc

  if (doc) {
    // Cast to align with PDFSinglePageViewer's expected PDFDocumentProxy type, avoiding
    // nominal type mismatches across pdfjs-dist submodules (AnnotationStorage #private).
    singlePageViewer?.setDocument(doc as unknown as PDFDocumentProxy)
    linkService?.setDocument(doc as unknown as PDFDocumentProxy, null)
    findController?.setDocument(doc as unknown as PDFDocumentProxy)
  }
  else {
    try {
      // Clear document from viewer and services
      singlePageViewer?.setDocument(null as unknown as PDFDocumentProxy)
      linkService?.setDocument(null as unknown as PDFDocumentProxy, null)
      findController?.setDocument(null as unknown as PDFDocumentProxy)
    }
    catch {}
  }
}

/**
 * Sets up a resize observer for the container element.
 * Ensures the PDF page is always fit to the container size when resized.
 */
function setupResize(): void {
  if (resizeObs) {
    return
  }
  resizeObs = new ResizeObserver(() => {
    if (singlePageViewer) {
      // Re-apply scale to fit width on resize
      singlePageViewer.currentScaleValue = 'page-fit'
    }
  })
  if (containerRef.value) {
    resizeObs.observe(containerRef.value)
  }
}

/**
 * Sets up keyboard shortcuts for PDF navigation.
 * Configures arrow key bindings to navigate between pages when a PDF document is loaded.
 * Left/Up arrows go to the previous page, Right/Down arrows go to the next page.
 * Shortcuts are ignored when editing in form fields or text inputs.
 */
useKeyboard(
  [
    {
      keys: [{ key: 'ArrowLeft' }, { key: 'ArrowUp' }],
      handler: () => selectPrevPage(),
      when: () => canNavigate.value,
      description: 'Previous page',
    },
    {
      keys: [{ key: 'ArrowRight' }, { key: 'ArrowDown' }],
      handler: () => selectNextPage(),
      when: () => canNavigate.value,
      description: 'Next page',
    },
  ],
  { ignoreEditable: true },
)

/**
 * Watches for changes to the PDF document in the store.
 * When the document changes, applies the new document to the viewer.
 */
watch(
  () => pdfStore.doc,
  async () => {
    await applyDocument()
  },
)

/**
 * Watches for changes to the current page number in the store.
 * When the page changes, updates the viewer to display the new page.
 *
 * @param {number} pageNumber - The new page number.
 */
watch(
  () => pdfStore.currentPage,
  (pageNumber) => {
    if (singlePageViewer) {
      singlePageViewer.currentPageNumber = pageNumber
    }
  },
)

/**
 * Watches for changes to the page transform and updates the PDF viewer.
 * Uses nextTick to ensure the update happens after the current render cycle,
 * preventing flickering by avoiding immediate re-renders.
 */
watch(
  () => pdfStore.pageTransform,
  () => {
    if (isRendering.value) {
      return
    }

    singlePageViewer?.refresh()
  },
)

onMounted(async () => {
  await applyDocument()
  setupResize()
  setupPdfPageSync()
})

onBeforeUnmount(() => {
  if (resizeObs && containerRef.value) {
    resizeObs.unobserve(containerRef.value)
  }

  resizeObs = null

  try {
    singlePageViewer?.setDocument(null as unknown as PDFDocumentProxy)
    linkService?.setDocument(null as unknown as PDFDocumentProxy, null)
    findController?.setDocument(null as unknown as PDFDocumentProxy)
  }
  catch {}

  singlePageViewer = null
  linkService = null
  findController = null
  // remove eventBus from store
  pdfStore.setEventBus(null)
  eventBus = null
})
</script>

<template>
  <div ref="containerRef" class="page-view-container">
    <div ref="viewerRef" class="pdfViewer singlePageView"></div>
  </div>
</template>

<style scoped>
.page-view-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: auto;
}
.pdfViewer {
  display: block;
}
:deep(.textLayer) {
  mix-blend-mode: multiply;
}
:deep(.textLayer .highlight) {
  --highlight-bg-color: rgba(255, 220, 0, 0.8);
  --highlight-selected-bg-color: rgba(220, 4, 209, 0.5);
}
:deep(.textLayer .highlight.selected) {
  background-color: var(--highlight-selected-bg-color) !important;
}
</style>
