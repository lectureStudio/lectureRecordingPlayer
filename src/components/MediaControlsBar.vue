<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import PlaybackSpeedButton from '@/components/PlaybackSpeedButton.vue'
import { useFileActionPlayer } from '@/composables/useFileActionPlayer'
import { useFullscreenControls } from '@/composables/useFullscreenControls'
import { usePlayerControls } from '@/composables/usePlayerControls'
import { useTimeFormat } from '@/composables/useTimeFormat'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { useRecordingStore } from '@/stores/recording'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import RangeSlider from './RangeSlider.vue'
import SidebarPositionChooser from './SidebarPositionChooser.vue'
import SpeakerButton from './SpeakerButton.vue'

const { actionPlayer } = useFileActionPlayer()
const { selectPrevPage, selectNextPage } = usePlayerControls()
const media = useMediaControlsStore()
const recording = useRecordingStore()

const audioEl = ref<HTMLAudioElement | null>(null)
const objectUrl = ref<string | null>(null)

const { fullscreen, controlsVisible, toggleFullscreen, onUserActivity } =
  useFullscreenControls()

const { formatHHMMSS } = useTimeFormat()

const currentTime = computed(() => formatHHMMSS(media.currentTime))
const totalTime = computed(() => formatHHMMSS(media.totalTime))
const progressPercentage = computed(() => {
  if (media.totalTime === 0) {
    return 0
  }
  return (media.currentTime / media.totalTime) * 1000
})

const handleProgressChange = (value: number) => {
  if (media.totalTime === 0) {
    return
  }

  media.currentTime = (value / 1000) * media.totalTime
}

function onSeekStart() {
  media.startSeeking()

  if (fullscreen.value) {
    onUserActivity()
  }
}

function onSeekEnd() {
  media.stopSeeking()

  // Sync the audio element to the store's current time after seeking
  const audio = audioEl.value
  if (audio && media.totalTime > 0) {
    const timeInSeconds = media.currentTime / 1000
    audio.currentTime = timeInSeconds
  }

  if (fullscreen.value) {
    onUserActivity()
  }
}

function onSeekChange() {
  // This is called when the user is actively dragging the slider
  if (fullscreen.value) {
    onUserActivity()
  }
}

// Toggle play/pause of the audio element
const togglePlayPause = async () => {
  const el = audioEl.value
  if (!el) { return }

  try {
    if (el.paused || el.ended) {
      await el.play()
    }
    else {
      el.pause()
    }
  }
  catch (error) {
    console.error('Error toggling playback:', error)
    media.playbackState = 'error'
  }
}

onMounted(() => {
  const el = audioEl.value
  if (!el) { return }

  // Provide the audio element directly to the action player
  actionPlayer.value?.setAudioElement(el)

  // Initialize audio properties from the store (one-way binding: store -> element)
  el.volume = Math.max(0, Math.min(1, (media.volume ?? 100) / 100))
  el.muted = media.muted
  el.playbackRate = Number(media.playbackSpeed ?? 1)

  // Combined watcher for all media controls to reduce overhead
  const stopWatchMediaControls = watch(
    () =>
      [
        media.currentTime,
        media.volume,
        media.muted,
        media.playbackSpeed,
      ] as const,
    ([time, volume, muted, playbackSpeed]) => {
      const audio = audioEl.value
      if (!audio) { return }

      // If the audio element's current time is significantly different from the store's time, update it.
      // This is to avoid a feedback loop where 'timeupdate' events from the audio element
      // update the store, which then tries to update the audio element back.
      // Convert milliseconds to seconds for audio element
      const timeInSeconds = time / 1000
      if (Math.abs(audio.currentTime - timeInSeconds) > 1) {
        audio.currentTime = timeInSeconds
      }

      audio.volume = Math.max(0, Math.min(1, (volume ?? 0) / 100))
      audio.muted = muted
      audio.playbackRate = Number(playbackSpeed)
    },
    { immediate: false },
  )

  // Watch the recording store for audio Blob changes and set the audio element src
  const stopWatchSrc = watch(
    () => recording.audio,
    (blob) => {
      const a = audioEl.value
      // Revoke previous Object URL if any
      if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value)
        objectUrl.value = null
      }
      if (!a) { return }
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(new Blob([blob], { type: 'audio/wav' }))
        objectUrl.value = url
        a.src = url
        a.load()
      }
      else {
        a.removeAttribute('src')
        a.load()
      }
    },
    { immediate: true },
  )

  const onPlay = () => {
    media.playbackState = 'playing'
  }
  const onPause = () => {
    media.playbackState = 'paused'
  }
  const onEnded = () => {
    media.playbackState = 'ended'
  }
  const onError = (event: Event) => {
    console.error('Audio element error:', event)
    media.playbackState = 'error'
  }
  const onTimeUpdate = () => {
    if (el.duration && isFinite(el.duration)) {
      media.totalTime = el.duration * 1000 // Convert seconds to milliseconds
      // Only update currentTime if not currently seeking to avoid overriding user's seek position
      // This prevents the slider from jumping back during seek operations
      if (!media.seeking) {
        media.currentTime = el.currentTime * 1000 // Convert seconds to milliseconds
      }
    }
  }
  const onLoadedMetadata = () => {
    if (el.duration && isFinite(el.duration)) {
      media.totalTime = el.duration * 1000 // Convert seconds to milliseconds
    }
  }

  el.addEventListener('play', onPlay)
  el.addEventListener('pause', onPause)
  el.addEventListener('ended', onEnded)
  el.addEventListener('error', onError)
  el.addEventListener('timeupdate', onTimeUpdate)
  el.addEventListener('loadedmetadata', onLoadedMetadata)

  // Cleanup on unmounting
  onUnmounted(() => {
    el.removeEventListener('play', onPlay)
    el.removeEventListener('pause', onPause)
    el.removeEventListener('ended', onEnded)
    el.removeEventListener('error', onError)
    el.removeEventListener('timeupdate', onTimeUpdate)
    el.removeEventListener('loadedmetadata', onLoadedMetadata)

    // stop watchers
    stopWatchMediaControls()
    stopWatchSrc()

    // Revoke any remaining Object URL
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value)
      objectUrl.value = null
    }
  })
})
</script>

<template>
  <nav
    class="border-t border-base-300 bg-base-100 pt-1"
    :class="fullscreen
    ? 'fixed bottom-0 left-0 right-0 z-40 transform-gpu transition-all duration-400 ease-out bg-slate-100/95 dark:bg-gray-900/95 '
      + (controlsVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-full pointer-events-none')
    : ''"
    role="navigation"
    aria-label="Media controls"
  >
    <!-- First row -->
    <div class="flex items-center justify-between sm:px-2 gap-2">
      <div class="flex items-center gap-2"></div>
      <div class="flex items-center gap-2 sm:gap-4 w-full">
        <span class="tabular-nums">{{ currentTime }}</span>
        <RangeSlider
          class="w-full"
          :min="0"
          :max="1000"
          :model-value="progressPercentage"
          @mousedown="onSeekStart"
          @mouseup="onSeekEnd"
          @touchstart="onSeekStart"
          @touchend="onSeekEnd"
          @user-interaction="onSeekChange"
          @update:model-value="handleProgressChange"
          :tooltip-formatter="(v: number) => formatHHMMSS((v / 1000) * media.totalTime)"
          show-tooltip-on-click
          aria-label="Seek position"
          role="slider"
        />
        <span class="tabular-nums">{{ totalTime }}</span>
      </div>

      <div class="flex items-center gap-2"></div>
    </div>
    <!-- Second row -->
    <div class="flex items-center justify-between gap-2 m-1">
      <div class="flex items-center gap-2">
        <SpeakerButton />
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="selectPrevPage"
          class="btn btn-ghost w-10 h-10 p-0"
          aria-label="Previous track"
          type="button"
        >
          <AppIcon name="previous" class="w-6" />
        </button>
        <button
          @click="togglePlayPause"
          class="btn btn-ghost w-10 h-10 p-0"
          :aria-label="media.playbackState === 'playing' ? 'Pause' : 'Play'"
          type="button"
        >
          <AppIcon
            :name="media.playbackState === 'playing' ? 'pause' : 'play'"
            class="w-6"
          />
        </button>
        <button
          @click="selectNextPage"
          class="btn btn-ghost w-10 h-10 p-0"
          aria-label="Next track"
          type="button"
        >
          <AppIcon name="next" class="w-6" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <SidebarPositionChooser class="hidden lg:inline-block" />
        <PlaybackSpeedButton />
        <button
          class="btn btn-ghost w-10 h-10 p-0"
          :aria-label="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          type="button"
          @click="toggleFullscreen"
        >
          <AppIcon
            :name="fullscreen
            ? 'fullscreen-minimize'
            : 'fullscreen-maximize'"
            class="w-6"
          />
        </button>
      </div>
    </div>
    <audio
      ref="audioEl"
      preload="metadata"
      aria-hidden="true"
    >
      Your browser does not support the audio element.
    </audio>
  </nav>
</template>
