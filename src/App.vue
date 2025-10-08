<script setup lang="ts">
import NavigationBar from '@/components/NavigationBar.vue'
import SlideView from '@/components/SlideView.vue'
import { loadRecording } from '@/services/recordingLoader.ts'
import { useMediaControlsStore } from '@/stores/mediaControls.ts'
import { useRecordingStore } from '@/stores/recording.ts'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import AppLayout from './components/AppLayout.vue'
import MediaControlsBar from './components/MediaControlsBar.vue'
import PDFThumbnailBar from './components/PDFThumbnailBar.vue'
import { useScreenWakeLock } from './composables/useScreenWakeLock'
import { usePdfStore } from './stores/pdf'
import { loadRecordingWithFallback } from './utils/storage'

const mediaStore = useMediaControlsStore()
const pdfStore = usePdfStore()
const recordingStore = useRecordingStore()
const recording = '#{recording}'

// Initialize screen wake lock
const {
  isSupported,
  requestWakeLock,
  releaseWakeLock,
  handleVisibilityChange,
} = useScreenWakeLock()

onMounted(async () => {
  try {
    await loadRecordingWithFallback(recording, '/test.plr', loadRecording, {
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
  const handleVisibilityChangeEvent = () => {
    const shouldBeActive = mediaStore.playbackState === 'playing'
    handleVisibilityChange(shouldBeActive)
  }

  document.addEventListener('visibilitychange', handleVisibilityChangeEvent)

  // Cleanup visibility change listener on unmount
  onBeforeUnmount(() => {
    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChangeEvent,
    )
    // Dispose resources
    pdfStore.dispose()
  })
})
</script>

<template>
  <AppLayout>
    <template #top>
      <NavigationBar />
    </template>
    <template #sidebar>
      <PDFThumbnailBar />
    </template>
    <template #bottom>
      <MediaControlsBar />
    </template>
    <SlideView />
  </AppLayout>
</template>
