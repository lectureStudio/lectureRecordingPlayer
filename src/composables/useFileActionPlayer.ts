import { FileActionPlayer } from '@/api/action/file-action-player'
import { SlideDocument } from '@/api/model/document'
import type { Page } from '@/api/model/page'
import { RenderController } from '@/api/render/render-controller'
import { RenderSurface } from '@/api/render/render-surface'
import { VideoRenderSurface } from '@/api/render/video-render-surface'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { useRecordingStore } from '@/stores/recording'
import { storeToRefs } from 'pinia'
import { markRaw, readonly, shallowRef, watch } from 'vue'

const player = shallowRef<FileActionPlayer | null>(null)

let renderController: RenderController | null = null

const pendingCanvasElements: {
  actionCanvas: HTMLCanvasElement | null
  volatileCanvas: HTMLCanvasElement | null
  videoElement: HTMLVideoElement | null
} = {
  actionCanvas: null,
  volatileCanvas: null,
  videoElement: null,
}

/**
 * Adapter to provide pages from the recording store to the FileActionPlayer.
 * This works because of duck typing, as FileActionPlayer only uses the getPage method.
 */
const documentAdapter = {
  getPage(pageNumber: number): Page {
    return useRecordingStore().getPage(pageNumber)
  },
} as unknown as SlideDocument

export function useFileActionPlayer() {
  /**
   * Registers canvas elements for the player. This can be called multiple times
   * to update the canvas elements when components remount.
   *
   * @param actionCanvas The HTMLCanvasElement to render permanent annotations on.
   * @param volatileCanvas The HTMLCanvasElement to render temporary annotations on (e.g., during drawing).
   * @param videoElement The HTMLVideoElement for video playback.
   */
  function registerCanvasElements(
    actionCanvas: HTMLCanvasElement,
    volatileCanvas: HTMLCanvasElement,
    videoElement: HTMLVideoElement,
  ) {
    pendingCanvasElements.actionCanvas = actionCanvas
    pendingCanvasElements.volatileCanvas = volatileCanvas
    pendingCanvasElements.videoElement = videoElement

    // If the player is already initialized, update the render controller with new elements
    if (player.value && renderController) {
      updateRenderController()
    }
  }

  /**
   * Creates a new render controller with the current canvas elements.
   */
  function createRenderController() {
    if (
      !pendingCanvasElements.actionCanvas
      || !pendingCanvasElements.volatileCanvas
      || !pendingCanvasElements.videoElement
    ) {
      return
    }

    const renderSurface = markRaw(new RenderSurface(pendingCanvasElements.actionCanvas))
    const volatileRenderSurface = markRaw(new RenderSurface(pendingCanvasElements.volatileCanvas))
    // Create a video render surface with callbacks to show/hide slides when video should be shown/hidden
    const videoRenderSurface = markRaw(
      new VideoRenderSurface(
        pendingCanvasElements.videoElement,
        () => {
          // Hide video, show slides
          renderController?.showPdfAndCanvas()
        },
        () => {
          // Show video, hide slides
          renderController?.hidePdfAndCanvas()
        },
      ),
    )

    renderController = markRaw(new RenderController(renderSurface, volatileRenderSurface, videoRenderSurface))
  }

  /**
   * Updates the render controller with new canvas elements.
   */
  function updateRenderController() {
    if (
      !renderController
      || !pendingCanvasElements.actionCanvas
      || !pendingCanvasElements.volatileCanvas
      || !pendingCanvasElements.videoElement
    ) {
      return
    }

    // Update the render controller with new canvas elements
    // This avoids recreating the entire controller and player
    renderController.updateCanvasElements(
      pendingCanvasElements.actionCanvas,
      pendingCanvasElements.volatileCanvas,
      pendingCanvasElements.videoElement,
    )
  }

  /**
   * Initializes the FileActionExecutor.
   * This should be called once from the app level, not from individual components.
   */
  function initializePlayer() {
    if (player.value) {
      return
    }

    // Check if we have canvas elements available
    if (
      !pendingCanvasElements.actionCanvas
      || !pendingCanvasElements.volatileCanvas
      || !pendingCanvasElements.videoElement
    ) {
      console.warn('Canvas elements not available for player initialization')
      return
    }

    const recordingStore = useRecordingStore()
    const mediaStore = useMediaControlsStore()
    const { actions } = storeToRefs(recordingStore)

    createRenderController()

    let initialized = false

    if (!renderController) {
      console.warn('Render controller not available for player initialization')
      return
    }

    player.value = markRaw(new FileActionPlayer(documentAdapter, renderController))

    // Load recorded pages into the player and initialize once available
    watch(
      actions,
      (newActions) => {
        player.value?.setRecordedPages(newActions ?? [])
        if (!initialized && newActions && newActions.length > 0 && player.value) {
          try {
            player.value.init()
            initialized = true
          }
          catch (e) {
            console.error(e)
          }
        }
      },
      { immediate: true },
    )

    // Keep the action player's clock in sync with the audio's current time (ms -> ms)
    watch(
      () => mediaStore.currentTime,
      (t) => {
        if (player.value) {
          const time = t ?? 0

          if (mediaStore.seeking) {
            player.value.seekByTime(time)
          }
        }

        // Update video synchronization during seeking and normal playback
        // During seeking: full sync including time updates
        // During normal playback: only visibility changes (show/hide video)
        if (renderController) {
          renderController.updateVideoSync()
        }
      },
      { immediate: true },
    )

    // Handle video seeking when seeking stops
    watch(
      () => mediaStore.seeking,
      (isSeeking) => {
        if (!isSeeking && renderController) {
          // Seeking has stopped, update video sync
          renderController.updateVideoSync()
        }
      },
    )

    // React to media playback state: start/suspend/stop the action player
    watch(
      () => mediaStore.playbackState,
      (state) => {
        const p = player.value
        if (!p) { return }
        switch (state) {
          case 'playing':
            if (!p.started()) {
              p.start()
            }
            break
          case 'paused':
            if (p.started()) {
              p.suspend()
            }
            break
          case 'ended':
            if (p.started() || p.suspended()) {
              p.stop()
            }
            break
          case 'error':
            // The safest default is to suspend drawing
            if (p.started()) {
              p.suspend()
            }
            break
        }

        // Update video playback state
        if (renderController) {
          renderController.updateVideoPlaybackState()
        }
      },
      { immediate: true },
    )
  }

  /**
   * Stops the player and cleans up resources like RenderController and its surfaces.
   */
  function destroyPlayer() {
    const p = player.value
    if (p) {
      if (p.started() || p.suspended()) {
        p.stop()
      }
    }
    renderController?.destroy()
    renderController = null
    player.value = null
  }

  return {
    /**
     * The FileActionExecutor instance.
     * It's wrapped in readonly to prevent accidental replacement.
     */
    actionPlayer: readonly(player),
    initializePlayer,
    registerCanvasElements,
    destroyPlayer,
  }
}
