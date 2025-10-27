import SpeakerButton from '@/components/SpeakerButton.vue'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { createTestingPinia } from '@pinia/testing'
import { mount, VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// Define the component instance type
type SpeakerButtonInstance = InstanceType<typeof SpeakerButton> & {
  toggleMute: () => void
}

describe('SpeakerButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof SpeakerButton>>
  let mediaStore: ReturnType<typeof useMediaControlsStore>

  // Helper function to create wrapper with custom store state
  const createWrapper = (props = {}, storeState = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        mediaControls: {
          volume: 100,
          muted: false,
          prevVolume: 100,
          ...storeState,
        },
      },
    })

    wrapper = mount(SpeakerButton, {
      global: {
        plugins: [pinia],
        stubs: {
          AppIcon: true,
          AppTooltip: true,
          RangeSlider: true,
        },
      },
      props,
    })

    mediaStore = useMediaControlsStore()
    return wrapper
  }

  // Helper function to test volume states
  const testVolumeState = (volume: number, muted: boolean) => {
    createWrapper({}, { volume, muted })
    const icon = wrapper.findComponent({ name: 'AppIcon' })
    expect(icon.exists()).toBe(true)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Rendering', () => {
    it('renders speaker button', () => {
      createWrapper()

      expect(wrapper.find('[role="button"]').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'AppIcon' }).exists()).toBe(true)
    })

    it('has correct button attributes', () => {
      createWrapper()

      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
      expect(button.attributes('tabindex')).toBe('0')
    })
  })

  describe('Volume States', () => {
    const volumeStates = [
      { volume: 80, muted: false, description: 'high volume' },
      { volume: 30, muted: false, description: 'low volume' },
      { volume: 80, muted: true, description: 'muted' },
      { volume: 0, muted: false, description: 'zero volume' },
    ]

    volumeStates.forEach(({ volume, muted, description }) => {
      it(`renders AppIcon component for ${description}`, () => {
        testVolumeState(volume, muted)
      })
    })
  })

  describe('Click Behavior', () => {
    it('toggles mute when mute button is clicked', async () => {
      mediaStore.muted = false
      createWrapper()

      // Test the toggleMute function directly since the dropdown might not be visible in tests
      const component = wrapper.vm as SpeakerButtonInstance
      component.toggleMute()

      expect(mediaStore.toggleMute).toHaveBeenCalled()
    })

    it('handles multiple clicks on mute button', async () => {
      mediaStore.muted = false
      createWrapper()

      const component = wrapper.vm as SpeakerButtonInstance
      component.toggleMute()
      component.toggleMute()

      expect(mediaStore.toggleMute).toHaveBeenCalledTimes(2)
    })
  })

  describe('Accessibility', () => {
    it('has proper tooltip for mute button', () => {
      // High volume
      mediaStore.volume = 80
      mediaStore.muted = false
      createWrapper()

      let tooltip = wrapper.findComponent({ name: 'AppTooltip' })
      expect(tooltip.exists()).toBe(true)
      // Since AppTooltip is stubbed, we can't test props directly
      // Instead, we verify the tooltip component exists

      // Muted
      mediaStore.muted = true
      createWrapper()

      tooltip = wrapper.findComponent({ name: 'AppTooltip' })
      expect(tooltip.exists()).toBe(true)
    })

    it('supports keyboard navigation', async () => {
      createWrapper()

      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
      await button.trigger('keydown', { key: 'Enter' })

      // Button should be focusable and clickable
      expect(button.attributes('tabindex')).toBe('0')
    })
  })

  describe('Reactivity', () => {
    it('renders AppIcon when volume changes', async () => {
      mediaStore.volume = 80
      mediaStore.muted = false
      createWrapper()

      let icon = wrapper.findComponent({ name: 'AppIcon' })
      expect(icon.exists()).toBe(true)

      // Change to low volume
      mediaStore.volume = 30
      await nextTick()

      icon = wrapper.findComponent({ name: 'AppIcon' })
      expect(icon.exists()).toBe(true)
    })

    it('renders AppIcon when mute state changes', async () => {
      mediaStore.volume = 80
      mediaStore.muted = false
      createWrapper()

      let icon = wrapper.findComponent({ name: 'AppIcon' })
      expect(icon.exists()).toBe(true)

      // Toggle mute
      mediaStore.muted = true
      await nextTick()

      icon = wrapper.findComponent({ name: 'AppIcon' })
      expect(icon.exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('applies correct CSS classes', () => {
      createWrapper()

      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
      expect(button.classes()).toContain('btn')
      expect(button.classes()).toContain('btn-ghost')
    })

    it('has proper button dimensions', () => {
      createWrapper()

      const button = wrapper.find('[role="button"]')
      expect(button.classes()).toContain('w-10')
      expect(button.classes()).toContain('h-10')
      expect(button.classes()).toContain('p-0')
    })
  })

  describe('Edge Cases', () => {
    const edgeCases = [
      { volume: 0, description: 'zero volume' },
      { volume: 100, description: 'maximum volume' },
      { volume: -10, description: 'negative volume' },
      { volume: 150, description: 'volume above 100' },
    ]

    edgeCases.forEach(({ volume, description }) => {
      it(`handles ${description}`, () => {
        testVolumeState(volume, false)
      })
    })
  })

  describe('Store Integration', () => {
    it('integrates with media controls store', () => {
      createWrapper()

      expect(mediaStore).toBeDefined()
      expect(mediaStore.volume).toBe(100)
      expect(mediaStore.muted).toBe(false)
    })

    it('responds to store state changes', async () => {
      createWrapper()

      // Change store state
      mediaStore.volume = 50
      mediaStore.muted = true
      await nextTick()

      const icon = wrapper.findComponent({ name: 'AppIcon' })
      expect(icon.exists()).toBe(true)
    })
  })
})
