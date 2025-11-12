<script setup lang="ts">
import { SimpleActionExecutor } from '@/api/action/simple-action-executor.ts'
import { SlideDocument } from '@/api/model/document'
import { Page } from '@/api/model/page'
import { BufferedRenderSurface } from '@/api/render/buffered-render-surface.ts'
import { StaticRenderController } from '@/api/render/static-render-controller.ts'
import { usePlayerControls } from '@/composables/usePlayerControls'
import { useRecordingStore } from '@/stores/recording.ts'
import { type PDFPageProxy, RenderingCancelledException } from 'pdfjs-dist'
import type { RenderTask } from 'pdfjs-dist/types/src/display/api'
import type { ComponentPublicInstance } from 'vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { RecycleScroller } from 'vue-virtual-scroller'
import { parsePx, sumParentsBoxModel } from '../composables/dom'
import { usePdfStore } from '../stores/pdf'

/**
 * Store instance providing access to the PDF document and related state.
 * Used throughout the component to interact with the PDF document.
 */
const pdfStore = usePdfStore()

/**
 * Store instance providing access to recording-related state and operations.
 * Used to manage and track recording sessions and their data.
 */
const recordingStore = useRecordingStore()

const { selectPage } = usePlayerControls()

const scroller = ref<typeof RecycleScroller | null>(null)

/**
 * Reactive array that stores the page items for the PDF thumbnail bar.
 * Each item will contain the page number and a key for the RecycleScroller component.
 * This is later populated based on the PDF document's page count.
 */
const pageItems = ref(new Array<{ pageNumber: number }>())

/**
 * Reactive map that associates PDF page numbers with their corresponding canvas elements.
 * This map is used to track which pages have been rendered and to access their canvases
 * for rendering operations and cleanup.
 */
const canvasMap = ref(new Map<number, HTMLCanvasElement>())

/**
 * Tracks in-flight render/cancel operations per canvas to prevent concurrent
 * PDF.js render() calls targeting the same <canvas>. Using WeakMap ensures
 * entries are garbage-collected when canvases are removed.
 */
const canvasRenderPromiseMap = new WeakMap<HTMLCanvasElement, Promise<void>>()

/**
 * Caches which pages have had their shapes loaded into the action executor.
 * Ensures loadAllShapes() is invoked at most once per page per document.
 */
const shapesLoadedPages = new Set<number>()

/**
 * Remembers what was last rendered into a given canvas to avoid redundant
 * rendering when the same page at the same size is requested again.
 */
const canvasRenderSignature = new WeakMap<
  HTMLCanvasElement,
  { pageNum: number; width: number; height: number }
>()

/**
 * Reference to the thumbnail bar DOM element.
 * Used to measure dimensions and observe resize events.
 */
const thumbBarRef = ref<HTMLDivElement | null>(null)

/**
 * The computed usable width of the thumbnail bar (in pixels).
 * Accounts for padding and is used to determine the appropriate thumbnail scaling.
 */
const measuredWidth = ref<number>(0)

/**
 * The computed height of each thumbnail item (in pixels).
 * Used by RecycleScroller to properly size and position thumbnails in the virtual list.
 */
const measuredHeight = ref<number>(0)

/**
 * Tracks active PDF.js render tasks by page number.
 * This map enables cancellation of in-progress renders when a page needs to be re-rendered
 * or when the component is unmounted.
 *
 * Key: Page number (1-based)
 * Value: PDF.js RenderTask for that page
 */
const renderTaskMap = new Map<number, RenderTask>()

/**
 * Executor instance used to handle slide document actions for the current PDF.
 * Initialized when a PDF document is loaded and used to manage page-level operations.
 * Set to null when no document is loaded or when the component is cleaning up.
 */
let actionExecutor: SimpleActionExecutor | null = null

/**
 * ResizeObserver instance used to monitor thumbnail bar size changes.
 */
let ro: ResizeObserver | null = null

/**
 * ID reference for the requestAnimationFrame used to debounce resize events.
 * When null, no resize update is scheduled. When set to a number, a frame
 * has been requested to process the resize.
 */
let resizeRafId: number | null = null

/**
 * Simple Deferred helper to create a promise with external resolve/reject.
 */
function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/**
 * Cancels an active PDF page rendering task for a specific page.
 *
 * @param pageNum - The page number whose render task should be canceled.
 *
 * @returns A promise that resolves when the cancellation is complete.
 */
async function cancelRender(pageNum: number) {
  const task = renderTaskMap.get(pageNum)
  if (!task) {
    return
  }

  renderTaskMap.delete(pageNum)

  try {
    task.cancel()
    await task.promise
  }
  catch {
    // Ignore cancellation rejection
  }
}

/**
 * Updates the computed available width for thumbnails based on the thumbnail bar's dimensions.

 * If the thumbnail bar element is not available, both measuredWidth and
 * measuredHeight are reset to 0.
 *
 * The calculated width is used for properly sizing and scaling PDF thumbnails.
 */
function updateComputedWidth() {
  const el = thumbBarRef.value
  if (!el) {
    measuredWidth.value = 0
    measuredHeight.value = 0
    return
  }
  const cs = getComputedStyle(el)
  const horizontalPadding = parsePx(cs.paddingLeft) + parsePx(cs.paddingRight)
  const innerWidth = Math.max(0, el.clientWidth - horizontalPadding)
  measuredWidth.value = Math.max(1, Math.floor(innerWidth - 20))
}

/**
 * Schedules a width update using requestAnimationFrame for better performance.
 * Implements debouncing to prevent excessive updates during rapid resize events.
 * Only schedules a new frame if there isn't already one pending.
 */
function scheduleUpdateWidth() {
  if (resizeRafId != null) {
    return
  }
  resizeRafId = requestAnimationFrame(() => {
    resizeRafId = null
    updateComputedWidth()
  })
}

/**
 * Sets or removes a canvas reference for a specific PDF page in the canvas map.
 * When a canvas element is provided, it's added to the map, and page rendering is initiated.
 * When null is provided, the canvas is removed from the map, and any ongoing rendering is canceled.
 *
 * @param page - The page number associated with the canvas element.
 * @param el - The canvas element to associate with the page, or null to remove the association.
 */
function setCanvasRef(page: number, el: HTMLCanvasElement | null) {
  const map = canvasMap.value
  if (el) {
    map.set(page, el)
    // Try rendering immediately when the ref appears
    void renderPage(page)
  }
  else {
    map.delete(page)

    cancelRender(page)
  }
}

/**
 * Creates a VNode ref handler function for a specific page's canvas element.
 * This factory helps manage canvas references in the PDF thumbnail viewer,
 * allowing proper tracking when canvas elements are mounted or unmounted.
 *
 * @param page - The page number associated with this canvas reference.
 *
 * @returns A ref handler function compatible with Vue's ref system.
 */
function canvasVNodeRefFactory(page: number) {
  return (refEl: Element | ComponentPublicInstance | null) => {
    setCanvasRef(page, refEl as HTMLCanvasElement | null)
  }
}

/**
 * Resizes a canvas element to fit a PDF page thumbnail within its container.
 *
 * @param canvas - The HTMLCanvasElement to resize.
 * @param page - The pdf-js page object.
 *
 * @returns The target width and height of the canvas bitmap.
 */
function sizeCanvasForPage(canvas: HTMLCanvasElement, page: PDFPageProxy) {
  const initialViewport = page.getViewport({ scale: 1 })

  // Determine available CSS width from the canvas parent (fallback to computed width)
  const parent = canvas.parentElement as HTMLElement | null
  const availableWidth = Math.max(1, parent?.offsetWidth || 1)

  // Compute viewport scaled to the available CSS width
  const scale = availableWidth / initialViewport.width
  const viewport = page.getViewport({ scale })

  // Account for HiDPI (DPR)
  const dpr = window.devicePixelRatio || 1

  // Set the canvas intrinsic bitmap size and CSS size
  canvas.style.width = `${Math.floor(viewport.width)}px`
  canvas.style.height = `${Math.floor(viewport.height)}px`
  const targetW = Math.floor(viewport.width * dpr)
  const targetH = Math.floor(viewport.height * dpr)

  if (canvas.width !== targetW || canvas.height !== targetH) {
    // Create a temporary canvas to preserve content during resize
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    const mainCtx = canvas.getContext('2d')

    if (tempCtx && mainCtx && canvas.width > 0 && canvas.height > 0) {
      // Set temp canvas size to current canvas size
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height

      // Copy current content to temp canvas using drawImage (much faster than ImageData)
      tempCtx.drawImage(canvas, 0, 0)

      // Resize main canvas
      canvas.width = targetW
      canvas.height = targetH

      // Restore content from temp canvas
      mainCtx.drawImage(tempCanvas, 0, 0, targetW, targetH)
    }
    else {
      // No existing content, just resize
      canvas.width = targetW
      canvas.height = targetH
    }
  }

  return { targetW, targetH }
}

/**
 * Renders a specific PDF page to its corresponding canvas element.
 *
 * This function handles the complete page rendering process, including
 * - Retrieving the page from the PDF document
 * - Calculating the appropriate scale based on available width
 * - Setting up the canvas with correct dimensions (accounting for the device pixel ratio)
 * - Executing the PDF.js render task
 * - Managing concurrent render operations (cancelling previous renders for the same page)
 *
 * @param pageNum - The 1-based page number to render.
 *
 * @returns A Promise that resolves when rendering completes or rejects on error.
 */
async function renderPage(pageNum: number) {
  if (!pdfStore.doc) {
    return
  }
  const canvas = canvasMap.value.get(pageNum)
  if (!canvas) {
    return
  }

  // Establish a per-canvas lock placeholder immediately to serialize operations
  const prevPromise = canvasRenderPromiseMap.get(canvas)
  const deferred = createDeferred<void>()

  canvasRenderPromiseMap.set(canvas, deferred.promise)

  if (prevPromise) {
    try {
      await prevPromise
    }
    catch {}
  }

  // Ensure we don't overlap renders on the same page
  await cancelRender(pageNum)

  try {
    const page = await pdfStore.getPage(pageNum)
    if (!page) {
      return
    }

    const { targetW, targetH } = sizeCanvasForPage(canvas, page)

    // Skip rendering if canvas has invalid dimensions (can happen during resize)
    if (targetW <= 0 || targetH <= 0) {
      return
    }

    // Skip if this canvas already has the same page rendered at the same size
    const sig = canvasRenderSignature.get(canvas)
    if (
      sig && sig.pageNum === pageNum && sig.width === targetW
      && sig.height === targetH
    ) {
      return
    }

    // Ensure we only load shapes once per page
    if (!shapesLoadedPages.has(pageNum)) {
      actionExecutor?.loadAllShapes(recordingStore.actions[pageNum - 1])
      shapesLoadedPages.add(pageNum)
    }

    const renderController = new StaticRenderController(
      new BufferedRenderSurface(canvas),
    )
    await renderController.renderPage(actionExecutor?.getPage(pageNum - 1))

    // Update the signature after a successful render
    canvasRenderSignature.set(canvas, {
      pageNum,
      width: targetW,
      height: targetH,
    })
  }
  catch (e: unknown) {
    // Ignore cancellation, log others
    if (!(e instanceof RenderingCancelledException)) {
      console.warn('Thumbnail render failed for page', pageNum, e)
    }
  }
  finally {
    // Release per-canvas lock and cleanup
    deferred.resolve()
    if (canvasRenderPromiseMap.get(canvas) === deferred.promise) {
      canvasRenderPromiseMap.delete(canvas)
    }
  }
}

/**
 * Computes the height of thumbnail items based on the first page of the PDF.
 *
 * This async function calculates the proper height for thumbnails by:
 * 1. Getting the first page of the PDF document
 * 2. Determining the appropriate scale based on available width
 * 3. Calculating the viewport dimensions at that scale
 * 4. Adding padding, margins, and the label height to get the total thumb height
 *
 * The result is stored in the measuredHeight reactive state variable, which is
 * used by the RecycleScroller to properly size and position thumbnails.
 *
 * @returns A Promise that resolves when the computation is complete.
 */
async function computeThumbSize() {
  const thumbBar = thumbBarRef.value
  if (!thumbBar) {
    return
  }

  const page = await pdfStore.getPage(1)
  if (!page) {
    return
  }

  const initialViewport = page.getViewport({ scale: 1 })

  // Determine available CSS width - prefer canvas parent if available, otherwise use measuredWidth
  let availableWidth = measuredWidth.value || 1
  const canvas = canvasMap.value.get(1)
  if (canvas) {
    const parent = canvas.parentElement as HTMLElement | null
    availableWidth = Math.max(1, parent?.offsetWidth || availableWidth)
  }
  availableWidth = Math.max(1, availableWidth)

  // Compute viewport scaled to the available CSS width
  const scale = availableWidth / initialViewport.width
  const viewport = page.getViewport({ scale })

  // Get label height - try to find it from the DOM structure
  let labelHeight = 0
  const label = thumbBar.querySelector('.label') as HTMLElement | null
  if (label) {
    labelHeight = label.offsetHeight
  }
  else {
    // Fallback: estimate label height if not found (typical label height)
    labelHeight = 20
  }

  // Calculate box model offsets - use canvas if available, otherwise try thumb-item structure
  let offset = { totalWidth: 0, totalHeight: 0 }
  if (canvas) {
    offset = sumParentsBoxModel(canvas, 3)
  }
  else {
    // Fallback: try to get offsets from thumb-item structure
    const thumbItem = thumbBar.querySelector('.thumb-item') as
      | HTMLElement
      | null
    const thumbItemContent = thumbBar.querySelector('.thumb-item-content') as
      | HTMLElement
      | null
    if (thumbItemContent) {
      offset = sumParentsBoxModel(thumbItemContent, 3)
    }
    else if (thumbItem) {
      // Use a reasonable estimate based on typical padding/margin values
      // thumb-item has padding: 0.5rem 0.5rem 0, margin-bottom: 0.5rem
      offset = { totalWidth: 16, totalHeight: 16 }
    }
  }

  // thumbSize.value = {
  //   width: viewport.width + offset.totalWidth,
  //   height: viewport.height + offset.totalHeight + labelHeight
  // }

  measuredHeight.value = viewport.height + offset.totalHeight + labelHeight
}

/**
 * Initializes the page items array when a PDF document is loaded.
 *
 * This function checks if a PDF document exists and if the page items array
 * is empty. If both conditions are met, it populates the array with objects
 * representing each page in the document. Each item contains a key and page number.
 *
 * This ensures the thumbnail bar properly displays pages for the current document.
 */
function ensureInitializedFromDoc() {
  const doc = pdfStore.doc
  if (doc) {
    const pages = Array.from({ length: doc.numPages }, (_, i) => (new Page(i)))
    actionExecutor = new SimpleActionExecutor(new SlideDocument(pages))

    if (pageItems.value.length === 0) {
      pageItems.value = Array.from({ length: doc.numPages }, (_, i) => ({
        key: i + 1,
        pageNumber: i + 1,
      }))
    }
  }
}

/**
 * Watches for changes to the PDF document and resets rendering state.
 *
 * This watcher is triggered whenever the PDF document changes and:
 * 1. Clears all canvas elements' dimensions
 * 2. Cancels any running render tasks
 * 3. Recalculates thumbnail size for the new document
 *
 * This ensures the thumbnail view properly adjusts when switching between
 * different PDF documents.
 */
watch(
  () => pdfStore.doc,
  async () => {
    // Clear canvases sizing when a document changes; pages will re-render when their refs mount
    canvasMap.value.forEach((c, pageNum) => {
      c.width = 0
      c.height = 0
      c.style.width = ''
      c.style.height = ''
      void cancelRender(pageNum)
    })

    // Reset per-document caches
    shapesLoadedPages.clear()

    ensureInitializedFromDoc()

    await computeThumbSize()
  },
)

/**
 * Watches for changes to the current page in the PDF document and scrolls the thumbnail scroller
 * to ensure the currently selected page thumbnail is visible in the viewport.
 *
 * @param newPage - The newly selected page number (1-based).
 */
watch(
  () => pdfStore.currentPage,
  async (newPage) => {
    scroller.value?.scrollToItem(newPage - 1)
  },
)

/**
 * Watches for changes to the thumbnail bar width and updates all thumbnails.
 * This ensures thumbnails are properly sized and rendered when the sidebar is resized
 * or when the application layout changes.
 */
watch(measuredWidth, async () => {
  await computeThumbSize()

  canvasMap.value.forEach((_c, pageNum) => {
    void renderPage(pageNum)
  })

  if (pdfStore.currentPage > 0) {
    scroller.value?.scrollToItem(pdfStore.currentPage - 1)
  }
})

onMounted(async () => {
  // Observe size changes to recompute width
  if (thumbBarRef.value) {
    ro = new ResizeObserver(() => scheduleUpdateWidth())
    ro.observe(thumbBarRef.value)
  }

  // If the document was already loaded before this component mounted (e.g., after reattaching),
  // make sure we initialize pageItems and sizing so thumbnails can render.
  ensureInitializedFromDoc()

  updateComputedWidth()

  // Wait for the next tick to ensure DOM is fully rendered
  await nextTick()

  // Compute thumbnail size after DOM is ready
  await computeThumbSize()

  // Wait another tick to ensure RecycleScroller has processed the item-size change
  await nextTick()

  if (pdfStore.currentPage > 0) {
    scroller.value?.scrollToItem(pdfStore.currentPage - 1)
  }
})

onBeforeUnmount(() => {
  if (ro) {
    try {
      ro.disconnect()
    }
    catch {}
    ro = null
  }
  if (resizeRafId != null) {
    cancelAnimationFrame(resizeRafId)
    resizeRafId = null
  }

  // Cancel any running renders
  renderTaskMap.forEach((_task, pageNum) => {
    void cancelRender(pageNum)
  })
})
</script>

<template>
  <div
    class="thumb-bar"
    ref="thumbBarRef"
    role="list"
    aria-label="PDF thumbnails"
  >
    <RecycleScroller
      ref="scroller"
      class="scroller"
      :items="pageItems"
      :item-size="measuredHeight || 100"
      key-field="key"
      v-slot="{ item }"
      skipHover
    >
      <div
        :key="item.pageNumber"
        class="thumb-item bg-base-300"
        :class="{ selected: item.pageNumber === pdfStore.currentPage }"
        @click="selectPage(item.pageNumber)"
        role="listitem"
        :aria-current="item.pageNumber === pdfStore.currentPage ? 'page' : undefined"
        :aria-label="`Page ${item.pageNumber}`"
        tabindex="0"
      >
        <div class="thumb-item-content">
          <canvas :ref="canvasVNodeRefFactory(item.pageNumber)" />
        </div>
        <div class="label">{{ item.pageNumber }}</div>
      </div>
    </RecycleScroller>
  </div>
</template>

<style scoped>
.scroller {
  width: 100%;
  height: 100%;
}
.thumb-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1px 8px;
  width: 100%;
}
.thumb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: fit-content;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0.5rem 0.5rem 0;
  margin-bottom: 0.5rem;
  outline: none;
}
.thumb-item:hover {
  background-color: var(--color-base-200);
}
.thumb-item.selected {
  border-color: var(--color-primary);
  border-width: 2px;
}
.thumb-item-content {
  position: relative;
  width: 100%;
}
.thumb-item-content canvas {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.1s ease-out;
  background-color: #f8f9fa;
}
.label {
  font-size: 12px;
  padding: 4px 0;
}
</style>
