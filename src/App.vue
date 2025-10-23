<script setup lang="ts">
import KeyboardShortcutsDialog from '@/components/KeyboardShortcutsDialog.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import SlideView from '@/components/SlideView.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts.ts'
import { loadRecording } from '@/services/recordingLoader'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { useRecordingStore } from '@/stores/recording'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppLayout from './components/AppLayout.vue'
import MediaControlsBar from './components/MediaControlsBar.vue'
import PDFThumbnailBar from './components/PDFThumbnailBar.vue'
import { useScreenWakeLock } from './composables/useScreenWakeLock'
import { usePdfStore } from './stores/pdf'
import { useVideoMappingStore } from './stores/videoMapping'
import { loadRecordingWithFallback } from './utils/storage'

const mediaStore = useMediaControlsStore()
const pdfStore = usePdfStore()
const recordingStore = useRecordingStore()
const videoMappingStore = useVideoMappingStore()

// base64 encoded recording used in production
const recording = '#{recording}'
// json string of video mapping (string to base64 encoded video) used in production
const videoMapping = '#{videoMapping}'

// Initialize screen wake lock
const {
  isSupported,
  requestWakeLock,
  releaseWakeLock,
  handleVisibilityChange,
} = useScreenWakeLock()

// Reference to the global keyboard shortcuts dialog
const keyboardShortcutsDialog = ref<{ showShortcutsDialog: () => void } | null>(
  null,
)

// Handle show shortcuts event from the navigation bar
const handleShowShortcuts = () => {
  keyboardShortcutsDialog.value?.showShortcutsDialog()
}

// Initialize keyboard shortcuts with the show dialog function
useKeyboardShortcuts(() => {
  keyboardShortcutsDialog.value?.showShortcutsDialog()
})

// Handle visibility change events
let handleVisibilityChangeEvent: (() => void) | null = null

onMounted(async () => {
  try {
    // Load video mapping first
    videoMappingStore.setVideoMapping(videoMapping)

    await loadRecordingWithFallback(recording, '/dev.plr', loadRecording, {
      mediaStore,
      recordingStore,
      pdfStore,
    })
  }
  catch (error) {
    console.error('Failed to load recording:', error)
  }

  // Watch playback state and manage wake lock accordingly
  watch(
    () => mediaStore.playbackState,
    async (state) => {
      if (!isSupported.value) {
        return
      }

      if (state === 'playing') {
        await requestWakeLock()
      }
      else {
        await releaseWakeLock()
      }
    },
    { immediate: true },
  )

  // Handle visibility change events
  handleVisibilityChangeEvent = () => {
    const shouldBeActive = mediaStore.playbackState === 'playing'
    handleVisibilityChange(shouldBeActive)
  }

  document.addEventListener('visibilitychange', handleVisibilityChangeEvent)
})

// Cleanup visibility change listener on unmount
onBeforeUnmount(() => {
  if (handleVisibilityChangeEvent) {
    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChangeEvent,
    )
  }
  // Dispose resources
  pdfStore.dispose()
})
</script>

<template>
  <AppLayout>
    <template #top>
      <NavigationBar @show-shortcuts="handleShowShortcuts" />
    </template>
    <template #sidebar>
      <PDFThumbnailBar />
    </template>
    <template #bottom>
      <MediaControlsBar />
    </template>
    <template #main>
      <SlideView />
    </template>
  </AppLayout>

  <!-- Global keyboard shortcuts dialog - always accessible -->
  <KeyboardShortcutsDialog ref="keyboardShortcutsDialog" />
</template>
