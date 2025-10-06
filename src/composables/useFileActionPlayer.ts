import { FileActionPlayer } from '@/api/action/file-action-player.ts'
import type { SlideDocument } from '@/api/model/document'
import type { Page } from '@/api/model/page'
import { RenderController } from '@/api/render/render-controller'
import { RenderSurface } from '@/api/render/render-surface.ts'
import { useMediaControlsStore } from '@/stores/mediaControls.ts'
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
   * This should be called from a component's onMounted hook with a canvas element.
   *
   * @param actionCanvas The HTMLCanvasElement to render permanent annotations on.
   * @param volatileCanvas The HTMLCanvasElement to render temporary annotations on (e.g., during drawing).
   */
  function initializePlayer(
    actionCanvas: HTMLCanvasElement,
    volatileCanvas: HTMLCanvasElement,
  ) {
    if (player.value) {
      return
    }

    const renderSurface = markRaw(new RenderSurface(actionCanvas))
    const volatileRenderSurface = markRaw(new RenderSurface(volatileCanvas))

    renderController = markRaw(new RenderController(renderSurface, volatileRenderSurface))

    player.value = markRaw(new FileActionPlayer(documentAdapter, renderController))

    const recordingStore = useRecordingStore()
    const mediaStore = useMediaControlsStore()
    const { actions } = storeToRefs(recordingStore)

    let initialized = false

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

    // Keep the action player's clock in sync with the audio's current time (seconds -> ms)
    watch(
      () => mediaStore.currentTime,
      (t) => {
        if (player.value) {
          const time = t ?? 0

          if (mediaStore.seeking) {
            player.value.seekByTime(time * 1000)
          }
        }
      },
      { immediate: true },
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
