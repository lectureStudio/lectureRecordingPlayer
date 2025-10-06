import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import MediaControlsBar from '@/components/MediaControlsBar.vue'

// Mocks for composables and stores
const mediaStore = reactive({
  volume: 100,
  playbackSpeed: 1,
  muted: false,
  currentTime: 0,
  totalTime: 0,
  playbackState: 'paused' as 'paused' | 'playing' | 'ended' | 'error',
  seeking: false,
  startSeeking: vi.fn(() => { mediaStore.seeking = true }),
  stopSeeking: vi.fn(() => { mediaStore.seeking = false }),
})

vi.mock('@/stores/mediaControls.ts', () => ({
  useMediaControlsStore: () => mediaStore,
}))

vi.mock('@/stores/recording.ts', () => ({
  useRecordingStore: () => ({
    audio: null as Blob | null,
    setRecording: vi.fn(),
  }),
}))

const fullscreen = { value: false }
const onUserActivity = vi.fn()
vi.mock('@/composables/useFullscreenControls.ts', () => ({
  useFullscreenControls: () => ({
    fullscreen,
    controlsVisible: true,
    toggleFullscreen: vi.fn(),
    onUserActivity,
  }),
}))

vi.mock('@/composables/usePlayerControls.ts', () => ({
  usePlayerControls: () => ({ selectPrevPage: vi.fn(), selectNextPage: vi.fn() }),
}))

vi.mock('@/composables/useFileActionPlayer.ts', () => ({
  useFileActionPlayer: () => ({ actionPlayer: { value: { setAudioElement: vi.fn() } } }),
}))

vi.mock('@/composables/useTimeFormat', () => ({
  useTimeFormat: () => ({ formatHHMMSS: (s: number) => `${Math.floor(s)}s` }),
}))

describe('MediaControlsBar.vue', () => {
  beforeEach(() => {
    // reset store
    mediaStore.currentTime = 0
    mediaStore.totalTime = 0
    mediaStore.playbackState = 'paused'
    fullscreen.value = false
    onUserActivity.mockClear()
  })

  it('computes progress percentage and passes to RangeSlider', async () => {
    mediaStore.totalTime = 200
    mediaStore.currentTime = 50
    const wrapper = mount(MediaControlsBar)
    const slider = wrapper.findComponent({ name: 'RangeSlider' })
    expect(slider.exists()).toBe(true)
    // modelValue is in per-thousand
    expect(slider.props('modelValue')).toBeCloseTo(250)
  })

  it('handleProgressChange updates currentTime and triggers onUserActivity in fullscreen', async () => {
    mediaStore.totalTime = 200
    const wrapper = mount(MediaControlsBar)
    const slider = wrapper.findComponent({ name: 'RangeSlider' })
    fullscreen.value = true
    await slider.vm.$emit('update:modelValue', 500) // 50%
    expect(mediaStore.currentTime).toBe(100)
    expect(onUserActivity).toHaveBeenCalled()
  })
})
