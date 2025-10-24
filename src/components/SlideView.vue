<script setup lang="ts">
import PDFPageView from '@/components/PDFPageView.vue'
import { useFileActionPlayer } from '@/composables/useFileActionPlayer'
import { usePdfStore } from '@/stores/pdf'
import type { EventBus } from 'pdfjs-dist/web/pdf_viewer.mjs'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const pdfStore = usePdfStore()
const { registerCanvasElements } = useFileActionPlayer()

const wrapperRef = ref<HTMLDivElement | null>(null)
const actionCanvasRef = ref<HTMLCanvasElement | null>(null)
const volatileCanvasRef = ref<HTMLCanvasElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

// Manage EventBus subscriptions to keep overlay sizes in sync with PDF.js events
const detachHandlers: Array<() => void> = []

function detachBus() {
  const fns = detachHandlers.splice(0)
  for (const fn of fns) {
    try {
      fn()
    }
    catch {}
  }
}

// Restrict to the minimal structural shape we need
function attachBus(bus: Pick<EventBus, 'on' | 'off'> | null) {
  detachBus()
  if (!bus) { return }

  const onPageRendered = (evt: { pageNumber?: number }) => {
    if (evt?.pageNumber === pdfStore.currentPage) {
      void updateCanvasSizes()
    }
  }
  bus.on('pagerendered', onPageRendered)

  detachHandlers.push(() => bus.off('pagerendered', onPageRendered))
}

async function updateCanvasSizes() {
  await nextTick()

  const wrapper = wrapperRef.value
  const action = actionCanvasRef.value
  const volatile = volatileCanvasRef.value

  if (!wrapper || !action || !volatile || !pdfStore.doc) {
    return
  }

  // Use the rendered PDF page canvas to get the current size
  const canvasEl = wrapper.querySelector('.pdfViewer .page canvas') as
    | HTMLCanvasElement
    | null
  if (!canvasEl) {
    return
  }

  const width = Math.max(0, canvasEl.offsetWidth)
  const height = Math.max(0, canvasEl.offsetHeight)

  if (!width || !height) {
    return
  }

  const dpr = window.devicePixelRatio || 1
  const canvasWidth = Math.floor(width * dpr)
  const canvasHeight = Math.floor(height * dpr)

  // Center overlays over the page (PDF page is centered in container)
  for (const canvas of [action, volatile]) {
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    if (canvas.width !== canvasWidth) {
      canvas.width = canvasWidth
    }
    if (canvas.height !== canvasHeight) {
      canvas.height = canvasHeight
    }
  }
}

watch(
  () => [pdfStore.doc, pdfStore.currentPage],
  () => void updateCanvasSizes(),
  { deep: false },
)

watch(() => pdfStore.eventBus, (bus) => attachBus(bus), { immediate: true })

onMounted(() => {
  const action = actionCanvasRef.value
  const volatile = volatileCanvasRef.value
  const video = videoRef.value

  if (action && volatile && video) {
    registerCanvasElements(action, volatile, video)
  }
})

onBeforeUnmount(() => {
  detachBus()
})
</script>

<template>
  <div class="viewer-wrapper overflow-hidden" ref="wrapperRef">
    <PDFPageView class="h-full" />
    <canvas ref="actionCanvasRef" class="action-canvas"></canvas>
    <canvas ref="volatileCanvasRef" class="volatile-canvas"></canvas>
    <video ref="videoRef"></video>
  </div>
</template>

<style scoped>
.viewer-wrapper {
  position: relative; /* establishes containing block for absolute children */
  flex: 1 1 auto; /* take remaining vertical space under Navigation */
  min-height: 0; /* allow content to shrink within flex container */
  justify-content: center;
  height: 100%;
}

/* Stack canvases on top of the PDFPageView and center to match page size */
.viewer-wrapper canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1; /* base overlay layer */
  pointer-events: none; /* allow interactions to pass through to PDF if needed */
  mix-blend-mode: multiply;
}

/* Video element positioning - initially hidden */
.viewer-wrapper video {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2; /* above canvases */
  display: none; /* initially hidden */
  max-width: 100%;
  max-height: 100%;
}
</style>
