<script setup lang="ts">
import NavigationBar from '@/components/NavigationBar.vue'
import SlideView from '@/components/SlideView.vue'
import { loadRecording } from '@/services/recordingLoader.ts'
import { useMediaControlsStore } from '@/stores/mediaControls.ts'
import { useRecordingStore } from '@/stores/recording.ts'
import { onBeforeUnmount, onMounted } from 'vue'
import AppLayout from './components/AppLayout.vue'
import MediaControlsBar from './components/MediaControlsBar.vue'
import PDFThumbnailBar from './components/PDFThumbnailBar.vue'
import { usePdfStore } from './stores/pdf'
import { loadRecordingWithFallback } from './utils/storage'

const mediaStore = useMediaControlsStore()
const pdfStore = usePdfStore()
const recordingStore = useRecordingStore()
const recording = '#{recording}'

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
})

onBeforeUnmount(() => {
  // Optional: dispose resources
  pdfStore.dispose()
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
