import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

// Force fallback path (no Fullscreen API), and simulate activity via class
vi.mock('@/utils/fullscreen', () => ({
  isFullscreenApiSupported: () => false,
  isSimulatedActive: () => document.documentElement.classList.contains('app-fullscreen'),
}))

import { useFullscreenControls } from '@/composables/useFullscreenControls'

const TestHost = defineComponent({
  name: 'TestHost',
  setup() {
    const { fullscreen, controlsVisible, toggleFullscreen, onUserActivity } = useFullscreenControls()
    return { fullscreen, controlsVisible, toggleFullscreen, onUserActivity }
  },
  template: '<div />',
})

describe('composables/useFullscreenControls', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('app-fullscreen')
    vi.useFakeTimers()
  })

  it('toggles simulated fullscreen and manages controls visibility timeout', async () => {
    const wrapper = mount(TestHost)
    const vm = wrapper.vm as unknown as {
      fullscreen: { value: boolean }
      controlsVisible: { value: boolean }
      toggleFullscreen: () => Promise<void>
      onUserActivity: () => void
    }

    // Enter fullscreen (fallback flow)
    await vm.toggleFullscreen()
    expect(vm.fullscreen.value).toBe(true)
    expect(document.documentElement.classList.contains('app-fullscreen')).toBe(true)
    // Immediately after entering, controls are visible
    expect(vm.controlsVisible.value).toBe(true)

    // After 2500ms, controls should hide
    vi.advanceTimersByTime(2500)
    expect(vm.controlsVisible.value).toBe(false)

    // User activity should reveal controls and reschedule hide
    vm.onUserActivity()
    expect(vm.controlsVisible.value).toBe(true)
    vi.advanceTimersByTime(2500)
    expect(vm.controlsVisible.value).toBe(false)

    // Exit fullscreen
    await vm.toggleFullscreen()
    expect(vm.fullscreen.value).toBe(false)
    expect(document.documentElement.classList.contains('app-fullscreen')).toBe(false)

    // In windowed mode, user activity should keep controls visible (no auto-hide scheduling)
    vm.onUserActivity()
    expect(vm.controlsVisible.value).toBe(true)
    vi.advanceTimersByTime(5000)
    expect(vm.controlsVisible.value).toBe(true)

    wrapper.unmount()
    vi.useRealTimers()
  })
})
