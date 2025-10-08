import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

/**
 * Composable for managing the Screen Wake Lock API
 * Prevents the screen from sleeping during playback
 */
export function useScreenWakeLock() {
  const isSupported = ref(false)
  const isActive = ref(false)
  const wakeLock = ref<WakeLockSentinel | null>(null)

  // Feature detection
  const checkSupport = () => {
    isSupported.value = 'wakeLock' in navigator && 'request' in navigator.wakeLock
  }

  /**
   * Requests a screen wake lock
   * @returns Promise<boolean> - true if successful, false otherwise
   */
  const requestWakeLock = async (): Promise<boolean> => {
    if (!isSupported.value || isActive.value) {
      return false
    }

    try {
      wakeLock.value = await navigator.wakeLock.request('screen')
      isActive.value = true

      // Handle wake lock release (e.g., when user switches tabs or locks screen)
      wakeLock.value.addEventListener('release', () => {
        isActive.value = false
        wakeLock.value = null
      })

      return true
    }
    catch (error) {
      console.warn('Failed to request wake lock:', error)
      return false
    }
  }

  /**
   * Releases the current wake lock
   */
  const releaseWakeLock = async (): Promise<void> => {
    if (wakeLock.value && isActive.value) {
      try {
        await wakeLock.value.release()

        isActive.value = false
        wakeLock.value = null
      }
      catch (error) {
        console.warn('Failed to release wake lock:', error)
      }
    }
  }

  /**
   * Handles visibility change events
   * Releases wake lock when page becomes hidden and requests it when visible (if needed)
   */
  const handleVisibilityChange = async (shouldBeActive: boolean) => {
    if (!isSupported.value) {
      return
    }

    if (document.hidden) {
      // Page is hidden, release wake lock to save battery
      await releaseWakeLock()
    }
    else if (shouldBeActive && !isActive.value) {
      // Page is visible and should have wake lock active, request it
      await requestWakeLock()
    }
  }

  // Cleanup on unmount
  onBeforeUnmount(async () => {
    await releaseWakeLock()
  })

  // Initialize support check
  onMounted(() => {
    checkSupport()
  })

  return {
    isSupported: readonly(isSupported),
    isActive: readonly(isActive),
    requestWakeLock,
    releaseWakeLock,
    handleVisibilityChange,
  }
}
