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
   * Initializes the FileActionExecutor.
   * This should be called from a component's onMounted hook with canvas and video elements.
   *
   * @param actionCanvas The HTMLCanvasElement to render permanent annotations on.
   * @param volatileCanvas The HTMLCanvasElement to render temporary annotations on (e.g., during drawing).
   * @param videoElement The HTMLVideoElement for video playback.
   */
  function initializePlayer(
    actionCanvas: HTMLCanvasElement,
    volatileCanvas: HTMLCanvasElement,
    videoElement: HTMLVideoElement,
  ) {
    if (player.value) {
      return
    }

    const recordingStore = useRecordingStore()
    const mediaStore = useMediaControlsStore()
    const { actions } = storeToRefs(recordingStore)

    const renderSurface = markRaw(new RenderSurface(actionCanvas))
    const volatileRenderSurface = markRaw(new RenderSurface(volatileCanvas))
    const videoRenderSurface = markRaw(new VideoRenderSurface(videoElement))

    let initialized = false

    renderController = markRaw(new RenderController(renderSurface, volatileRenderSurface, videoRenderSurface))

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

        // Update video synchronization only when not seeking
        if (renderController && !mediaStore.seeking) {
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
    destroyPlayer,
  }
}
