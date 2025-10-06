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

const mediaStore = useMediaControlsStore()
const pdfStore = usePdfStore()
const recordingStore = useRecordingStore()

onMounted(() => {
  fetch('/AAA.plr')
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch .plr file: ${res.status} ${res.statusText}`,
        )
      }

      const blob = await res.blob()
      const file = new File([blob], 'TEST.plr', {
        type: blob.type || 'application/octet-stream',
      })

      return loadRecording(file)
    })
    .then((recording) => {
      if (!recording.document) {
        throw new Error('Recording does not contain a document')
      }

      mediaStore.totalTime = recording.duration!
      recordingStore.setRecording(recording)

      void pdfStore.load(recording.document)
    })
    .catch((err) => {
      console.error('Failed to load recording', err)
    })
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
