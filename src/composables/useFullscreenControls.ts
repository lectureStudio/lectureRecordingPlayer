import { isFullscreenApiSupported, isSimulatedActive } from '@/utils/fullscreen'
import { onMounted, onUnmounted, ref } from 'vue'

// Singleton state shared across all consumers
const fullscreen = ref<boolean>(false)
const controlsVisible = ref<boolean>(true)
let hideControlsTimer: number | null = null
let consumers = 0
let listenersAttached = false

function clearHideTimer() {
  if (hideControlsTimer !== null) {
    window.clearTimeout(hideControlsTimer)
    hideControlsTimer = null
  }
}

function scheduleHideControls() {
  clearHideTimer()
  if (fullscreen.value) {
    hideControlsTimer = window.setTimeout(() => {
      controlsVisible.value = false
    }, 2500)
  }
}

function onUserActivity() {
  if (!fullscreen.value) { return }
  controlsVisible.value = true
  scheduleHideControls()
}

async function toggleFullscreen() {
  try {
    if (isFullscreenApiSupported()) {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
      else {
        await document.exitFullscreen()
      }
    }
    else {
      // Fallback for environments without the Fullscreen API (e.g., iOS Safari on iPhone)
      onFullscreenChange(!isSimulatedActive())
    }
  }
  catch (err) {
    console.error('Fullscreen toggle failed:', err)
  }
}

function onFullscreenChange(manualState?: boolean | Event) {
  if (typeof manualState === 'boolean') {
    fullscreen.value = manualState
  }
  else {
    fullscreen.value = !!document.fullscreenElement
  }

  const root = document.documentElement

  if (fullscreen.value) {
    root.classList.add('app-fullscreen')
    controlsVisible.value = true
    scheduleHideControls()
    attachActivityListeners()
  }
  else {
    root.classList.remove('app-fullscreen')
    clearHideTimer()
    controlsVisible.value = true
    detachActivityListeners()
  }
}

function onFsEvent(e: Event) {
  onFullscreenChange(e)
}

function attachActivityListeners() {
  if (listenersAttached) { return }
  window.addEventListener('mousemove', onUserActivity, { passive: true })
  window.addEventListener('mousedown', onUserActivity, { passive: true })
  window.addEventListener('touchstart', onUserActivity, { passive: true })
  listenersAttached = true
}

function detachActivityListeners() {
  if (!listenersAttached) { return }
  window.removeEventListener('mousemove', onUserActivity)
  window.removeEventListener('mousedown', onUserActivity)
  window.removeEventListener('touchstart', onUserActivity)
  listenersAttached = false
}

function ensureGlobalListeners() {
  document.addEventListener('fullscreenchange', onFsEvent)
  // Initialize state to reflect current fullscreen when first consumer mounts
  onFullscreenChange()
}

function removeGlobalListeners() {
  document.removeEventListener('fullscreenchange', onFsEvent)
  detachActivityListeners()
  clearHideTimer()
}

export function useFullscreenControls() {
  onMounted(() => {
    consumers += 1
    if (consumers === 1) {
      ensureGlobalListeners()
    }
  })

  onUnmounted(() => {
    consumers = Math.max(0, consumers - 1)
    if (consumers === 0) {
      removeGlobalListeners()
    }
  })

  return {
    fullscreen,
    controlsVisible,
    toggleFullscreen,
    onUserActivity,
  }
}
