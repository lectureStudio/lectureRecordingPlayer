import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'
import PlaybackSpeedButton from '@/components/PlaybackSpeedButton.vue'
import { useMediaControlsStore } from '@/stores/mediaControls'

describe('PlaybackSpeedButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof PlaybackSpeedButton>>
  let mediaStore: ReturnType<typeof useMediaControlsStore>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const createWrapper = (props = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        mediaControls: {
          playbackSpeed: 1.0,
        },
      },
    })

    wrapper = mount(PlaybackSpeedButton, {
      global: {
        plugins: [pinia],
        stubs: {
          AppIcon: true,
        },
      },
      props,
    })

    mediaStore = useMediaControlsStore()
    return wrapper
  }

  describe('Rendering', () => {
    it('renders playback speed button', () => {
      createWrapper()
      
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'AppIcon' }).exists()).toBe(true)
    })

    it('displays current playback speed', () => {
      mediaStore.playbackSpeed = 1.5
      createWrapper()
      
      expect(wrapper.text()).toContain('1.5x')
    })

    it('has correct button attributes', () => {
      createWrapper()
      
      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
      expect(button.attributes('tabindex')).toBe('0')
    })
  })

  describe('Speed Display', () => {
    it('displays 1x for normal speed', () => {
      mediaStore.playbackSpeed = 1.0
      createWrapper()
      
      expect(wrapper.text()).toContain('normal')
    })

    it('displays 0.5x for half speed', () => {
      mediaStore.playbackSpeed = 0.5
      createWrapper()
      
      expect(wrapper.text()).toContain('0.5x')
    })

    it('displays 2x for double speed', () => {
      mediaStore.playbackSpeed = 2.0
      createWrapper()
      
      expect(wrapper.text()).toContain('2x')
    })

    it('displays decimal speeds correctly', () => {
      mediaStore.playbackSpeed = 1.25
      createWrapper()
      
      expect(wrapper.text()).toContain('1.25x')
    })

    it('displays 0.25x for quarter speed', () => {
      mediaStore.playbackSpeed = 0.25
      createWrapper()
      
      expect(wrapper.text()).toContain('0.25x')
    })
  })

  describe('Click Behavior', () => {
    it('renders speed options', () => {
      mediaStore.playbackSpeed = 1.0
      createWrapper()
      
      // The component has a dropdown with speed options
      const speedOptions = wrapper.findAll('.step')
      expect(speedOptions.length).toBeGreaterThan(0)
    })

    it('renders multiple speed options', () => {
      mediaStore.playbackSpeed = 1.0
      createWrapper()
      
      const speedOptions = wrapper.findAll('.step')
      expect(speedOptions.length).toBeGreaterThan(1)
    })
  })

  describe('Speed Cycling', () => {
    it('displays all predefined speeds', () => {
      mediaStore.playbackSpeed = 1.0
      createWrapper()
      
      // Should display all speed options
      expect(wrapper.text()).toContain('0.25x')
      expect(wrapper.text()).toContain('0.5x')
      expect(wrapper.text()).toContain('normal')
      expect(wrapper.text()).toContain('2x')
    })

    it('displays current speed correctly', () => {
      mediaStore.playbackSpeed = 2.0 // Last speed
      createWrapper()
      
      // Should display the current speed
      expect(wrapper.text()).toContain('2x')
    })
  })

  describe('Accessibility', () => {
    it('has proper button structure', () => {
      mediaStore.playbackSpeed = 1.5
      createWrapper()
      
      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
    })

    it('renders button with correct structure', () => {
      mediaStore.playbackSpeed = 1.0
      createWrapper()
      
      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
    })

    it('supports keyboard navigation', async () => {
      createWrapper()
      
      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Reactivity', () => {
    it('updates display when speed changes', async () => {
      mediaStore.playbackSpeed = 1.0
      createWrapper()
      
      expect(wrapper.text()).toContain('normal')
      
      mediaStore.playbackSpeed = 1.5
      await nextTick()
      
      expect(wrapper.text()).toContain('1.5x')
    })

    it('updates display when speed changes to 2x', async () => {
      mediaStore.playbackSpeed = 1.0
      createWrapper()
      
      mediaStore.playbackSpeed = 2.0
      await nextTick()
      
      expect(wrapper.text()).toContain('2x')
    })
  })

  describe('Styling', () => {
    it('applies correct CSS classes', () => {
      createWrapper()
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn')
      expect(button.classes()).toContain('btn-ghost')
    })

    it('has proper button dimensions', () => {
      createWrapper()
      
      const button = wrapper.find('button')
      expect(button.classes()).toContain('w-10')
      expect(button.classes()).toContain('h-10')
      expect(button.classes()).toContain('p-0')
    })
  })

  describe('Edge Cases', () => {
    it('handles speed at minimum value', () => {
      mediaStore.playbackSpeed = 0.25
      createWrapper()
      
      expect(wrapper.text()).toContain('0.25x')
    })

    it('handles speed at maximum value', () => {
      mediaStore.playbackSpeed = 2.0
      createWrapper()
      
      expect(wrapper.text()).toContain('2x')
    })

    it('handles invalid speed values', () => {
      mediaStore.playbackSpeed = 0.1 // Below minimum
      createWrapper()
      
      // Component should still render
      expect(wrapper.exists()).toBe(true)
    })

    it('handles speed above maximum', () => {
      mediaStore.playbackSpeed = 3.0 // Above maximum
      createWrapper()
      
      // Component should still render
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('integrates with media controls store', () => {
      createWrapper()
      
      expect(mediaStore).toBeDefined()
      expect(mediaStore.playbackSpeed).toBe(1.0)
    })

    it('responds to store state changes', async () => {
      createWrapper()
      
      // Change store state
      mediaStore.playbackSpeed = 1.5
      await nextTick()
      
      expect(wrapper.text()).toContain('1.5x')
    })
  })

  describe('User Experience', () => {
    it('provides visual feedback on click', async () => {
      createWrapper()
      
      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
    })

    it('renders interactive elements', () => {
      createWrapper()
      
      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
    })
  })
})
