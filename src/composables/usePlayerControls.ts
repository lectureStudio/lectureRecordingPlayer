import { useFileActionPlayer } from '@/composables/useFileActionPlayer'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { usePdfStore } from '@/stores/pdf.ts'
import { watch } from 'vue'

export function usePlayerControls() {
  const { actionPlayer } = useFileActionPlayer()
  const media = useMediaControlsStore()
  const pdf = usePdfStore()

  /**
   * Navigates to the previous page in the document and updates media playback time accordingly.
   *
   * @returns {void}
   *
   * @side-effect Updates media.currentTime if a valid timestamp is found
   */
  const selectPrevPage = (): void => {
    const time = actionPlayer.value?.selectPreviousPage() ?? -1
    if (time >= 0) {
      media.currentTime = time / 1000
    }
  }

  /**
   * Navigates to the next page in the document and updates media playback time accordingly.
   *
   * @returns {void}
   *
   * @side-effect Updates media.currentTime if a valid timestamp is found
   */
  const selectNextPage = (): void => {
    const time = actionPlayer.value?.selectNextPage() ?? -1
    if (time >= 0) {
      media.currentTime = time / 1000
    }
  }

  /**
   * Navigates to a specific page in the document and updates media playback time accordingly.
   *
   * @param {number} page - The target page number (1-based)
   *
   * @returns {void}
   *
   * @side-effect Updates media.currentTime if a valid timestamp is found
   */
  const selectPage = (page: number): void => {
    // page is 1-based from UI, but player is likely 0-based
    const time = actionPlayer.value?.seekByPage(page - 1) ?? -1
    if (time >= 0) {
      media.currentTime = time / 1000
    }
  }

  /**
   * Sets up a watcher to sync media playback with PDF page changes.
   * This is useful for search result navigation.
   *
   * @returns {void}
   */
  const setupPdfPageSync = (): void => {
    watch(
      () => pdf.currentPage,
      (page) => {
        selectPage(page)
      },
    )
  }

  return {
    selectPrevPage,
    selectNextPage,
    selectPage,
    setupPdfPageSync,
  }
}
