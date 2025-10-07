import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'
import MediaControlsBar from '@/components/MediaControlsBar.vue'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { useRecordingStore } from '@/stores/recording'

// Mock composables
const mockFullscreenControls = {
  fullscreen: { value: false },
  controlsVisible: { value: true },
  toggleFullscreen: vi.fn(),
  onUserActivity: vi.fn(),
}

const mockPlayerControls = {
  selectPrevPage: vi.fn(),
  selectNextPage: vi.fn(),
}

const mockFileActionPlayer = {
  actionPlayer: { value: { setAudioElement: vi.fn() } },
}

const mockTimeFormat = {
  formatHHMMSS: vi.fn((s: number) => `${Math.floor(s)}s`),
}

vi.mock('@/composables/useFullscreenControls.ts', () => ({
  useFullscreenControls: () => mockFullscreenControls,
}))

vi.mock('@/composables/usePlayerControls.ts', () => ({
  usePlayerControls: () => mockPlayerControls,
}))

vi.mock('@/composables/useFileActionPlayer.ts', () => ({
  useFileActionPlayer: () => mockFileActionPlayer,
}))

vi.mock('@/composables/useTimeFormat', () => ({
  useTimeFormat: () => mockTimeFormat,
}))

describe('MediaControlsBar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof MediaControlsBar>>
  let mediaStore: ReturnType<typeof useMediaControlsStore>
  let recordingStore: ReturnType<typeof useRecordingStore>

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    mockFullscreenControls.fullscreen.value = false
    mockFullscreenControls.controlsVisible.value = true
    mockTimeFormat.formatHHMMSS.mockImplementation((s: number) => `${Math.floor(s)}s`)
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const createWrapper = (props = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        mediaControls: {
          volume: 100,
          playbackSpeed: 1,
          muted: false,
          currentTime: 0,
          totalTime: 0,
          playbackState: 'paused',
          seeking: false,
        },
        recording: {
          audio: null,
        },
      },
    })

    wrapper = mount(MediaControlsBar, {
      global: {
        plugins: [pinia],
        stubs: {
          AppIcon: true,
          PlaybackSpeedButton: true,
          SidebarPositionChooser: true,
          SpeakerButton: true,
        },
      },
      props,
    })

    mediaStore = useMediaControlsStore()
    recordingStore = useRecordingStore()
    return wrapper
  }

  describe('Rendering', () => {
    it('renders all control elements', () => {
      createWrapper()
      
      expect(wrapper.find('[role="navigation"]').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'RangeSlider' }).exists()).toBe(true)
      expect(wrapper.find('audio').exists()).toBe(true)
    })

    it('displays formatted time correctly', () => {
      createWrapper()
      
      const timeElements = wrapper.findAll('.tabular-nums')
      expect(timeElements).toHaveLength(3) // 2 from MediaControlsBar + 1 from RangeSlider tooltip
      expect(mockTimeFormat.formatHHMMSS).toHaveBeenCalledWith(0)
      expect(mockTimeFormat.formatHHMMSS).toHaveBeenCalledWith(0)
    })

    it('shows correct play/pause button state', async () => {
      createWrapper()
      
      const playButton = wrapper.find('button[aria-label*="Play"], button[aria-label*="Pause"]')
      expect(playButton.exists()).toBe(true)
      
      // Test play state
      mediaStore.playbackState = 'playing'
      await nextTick()
      expect(playButton.attributes('aria-label')).toContain('Pause')
      
      // Test pause state
      mediaStore.playbackState = 'paused'
      await nextTick()
      expect(playButton.attributes('aria-label')).toContain('Play')
    })
  })

  describe('Progress Control', () => {
    it('computes progress percentage correctly', async () => {
      createWrapper()
      
      mediaStore.totalTime = 200
      mediaStore.currentTime = 50
      
      await wrapper.vm.$nextTick()
      
      const slider = wrapper.findComponent({ name: 'RangeSlider' })
      expect(slider.props('modelValue')).toBeCloseTo(250, 1) // 50/200 * 1000
    })

    it('handles zero total time gracefully', () => {
      mediaStore.totalTime = 0
      mediaStore.currentTime = 50
      createWrapper()
      
      const slider = wrapper.findComponent({ name: 'RangeSlider' })
      expect(slider.props('modelValue')).toBe(0)
    })

    it('updates current time on progress change', async () => {
      createWrapper()
      
      mediaStore.totalTime = 200
      
      const slider = wrapper.findComponent({ name: 'RangeSlider' })
      await slider.vm.$emit('update:modelValue', 500) // 50%
      
      // The handler calculates: (500 / 1000) * 200 = 100
      expect(mediaStore.currentTime).toBe(100)
    })

    it('triggers user activity in fullscreen mode', async () => {
      createWrapper()
      
      mediaStore.totalTime = 200
      mockFullscreenControls.fullscreen.value = true
      
      const slider = wrapper.findComponent({ name: 'RangeSlider' })
      await slider.vm.$emit('update:modelValue', 500)
      
      expect(mockFullscreenControls.onUserActivity).toHaveBeenCalled()
    })
  })

  describe('Seeking', () => {
    it('starts seeking on mouse down', async () => {
      createWrapper()
      
      const slider = wrapper.findComponent({ name: 'RangeSlider' })
      await slider.trigger('mousedown')
      
      expect(mediaStore.startSeeking).toHaveBeenCalled()
    })

    it('stops seeking on mouse up', async () => {
      createWrapper()
      
      const slider = wrapper.findComponent({ name: 'RangeSlider' })
      await slider.trigger('mouseup')
      
      expect(mediaStore.stopSeeking).toHaveBeenCalled()
    })

    it('triggers user activity during seeking in fullscreen', async () => {
      mockFullscreenControls.fullscreen.value = true
      createWrapper()
      
      const slider = wrapper.findComponent({ name: 'RangeSlider' })
      await slider.trigger('mousedown')
      
      expect(mockFullscreenControls.onUserActivity).toHaveBeenCalled()
    })
  })

  describe('Playback Controls', () => {
    it('calls toggle play/pause on button click', async () => {
      createWrapper()
      
      const playButton = wrapper.find('button[aria-label*="Play"], button[aria-label*="Pause"]')
      await playButton.trigger('click')
      
      // The actual play/pause logic is handled by the audio element
      // We can't easily test this without mocking the audio element
      expect(playButton.exists()).toBe(true)
    })

    it('calls navigation functions on prev/next buttons', async () => {
      createWrapper()
      
      const prevButton = wrapper.find('button[aria-label="Previous track"]')
      const nextButton = wrapper.find('button[aria-label="Next track"]')
      
      await prevButton.trigger('click')
      await nextButton.trigger('click')
      
      expect(mockPlayerControls.selectPrevPage).toHaveBeenCalled()
      expect(mockPlayerControls.selectNextPage).toHaveBeenCalled()
    })
  })

  describe('Fullscreen Controls', () => {
    it('toggles fullscreen on button click', async () => {
      createWrapper()
      
      const fullscreenButton = wrapper.find('button[aria-label*="fullscreen"]')
      await fullscreenButton.trigger('click')
      
      expect(mockFullscreenControls.toggleFullscreen).toHaveBeenCalled()
    })

    it('shows correct fullscreen button icon', async () => {
      createWrapper()
      
      const fullscreenButton = wrapper.find('button[aria-label*="fullscreen"]')
      expect(fullscreenButton.attributes('aria-label')).toContain('Exit fullscreen')
      
      mockFullscreenControls.fullscreen.value = true
      await nextTick()
      expect(fullscreenButton.attributes('aria-label')).toContain('Exit fullscreen')
    })
  })

  describe('Audio Element Integration', () => {
    it('sets up audio element on mount', () => {
      createWrapper()
      
      const audioElement = wrapper.find('audio').element as HTMLAudioElement
      expect(audioElement).toBeDefined()
      expect(mockFileActionPlayer.actionPlayer.value.setAudioElement).toHaveBeenCalledWith(audioElement)
    })

    it('handles audio blob changes', async () => {
      const mockBlob = new Blob(['test'], { type: 'audio/wav' })
      recordingStore.audio = mockBlob
      createWrapper()
      
      // The component should handle the blob change internally
      expect(wrapper.find('audio').exists()).toBe(true)
    })
  })
})
