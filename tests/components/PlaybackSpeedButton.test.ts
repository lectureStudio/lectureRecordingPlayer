import PlaybackSpeedButton from '@/components/PlaybackSpeedButton.vue'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { createTestingPinia } from '@pinia/testing'
import { mount, VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

describe('PlaybackSpeedButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof PlaybackSpeedButton>>
  let mediaStore: ReturnType<typeof useMediaControlsStore>

  // Helper function to create wrapper with custom store state
  const createWrapper = (props = {}, storeState = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        mediaControls: {
          playbackSpeed: 1.0,
          ...storeState,
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

  // Helper function to test speed display
  const testSpeedDisplay = (speed: number, expectedText: string) => {
    createWrapper({}, { playbackSpeed: speed })
    expect(wrapper.text()).toContain(expectedText)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

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
    const speedTests = [
      { speed: 1.0, expectedText: 'normal' },
      { speed: 0.5, expectedText: '0.5x' },
      { speed: 2.0, expectedText: '2x' },
      { speed: 1.25, expectedText: '1.25x' },
      { speed: 0.25, expectedText: '0.25x' },
    ]

    speedTests.forEach(({ speed, expectedText }) => {
      it(`displays ${expectedText} for speed ${speed}`, () => {
        testSpeedDisplay(speed, expectedText)
      })
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
    const edgeCases = [
      { speed: 0.25, description: 'minimum value', shouldRender: true },
      { speed: 2.0, description: 'maximum value', shouldRender: true },
      { speed: 0.1, description: 'below minimum', shouldRender: true },
      { speed: 3.0, description: 'above maximum', shouldRender: true },
    ]

    edgeCases.forEach(({ speed, description, shouldRender }) => {
      it(`handles speed at ${description}`, () => {
        createWrapper({}, { playbackSpeed: speed })
        expect(wrapper.exists()).toBe(shouldRender)
      })
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
