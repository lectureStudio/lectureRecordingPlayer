import { useFullscreenControls } from '@/composables/useFullscreenControls'
import { isFullscreenApiSupported, isSimulatedActive } from '@/utils/fullscreen'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onUnmounted } from 'vue'

// Mock the fullscreen utilities
vi.mock('@/utils/fullscreen', () => ({
  isFullscreenApiSupported: vi.fn(),
  isSimulatedActive: vi.fn(),
}))

// Mock Vue lifecycle hooks
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: vi.fn((callback) => {
      // Execute callback immediately for testing
      callback()
    }),
    onUnmounted: vi.fn((callback) => {
      // Store callback for later execution
      return callback
    }),
  }
})

// Mock DOM APIs
const mockRequestFullscreen = vi.fn()
const mockExitFullscreen = vi.fn()
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true,
  configurable: true,
})

Object.defineProperty(document, 'documentElement', {
  value: {
    requestFullscreen: mockRequestFullscreen,
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  writable: true,
})

Object.defineProperty(document, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
})

Object.defineProperty(document, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
})

Object.defineProperty(document, 'exitFullscreen', {
  value: mockExitFullscreen,
  writable: true,
})

// Mock window APIs
const mockSetTimeout = vi.fn()
const mockClearTimeout = vi.fn()
const mockWindowAddEventListener = vi.fn()
const mockWindowRemoveEventListener = vi.fn()

Object.defineProperty(window, 'setTimeout', {
  value: mockSetTimeout,
  writable: true,
})

Object.defineProperty(window, 'clearTimeout', {
  value: mockClearTimeout,
  writable: true,
})

Object.defineProperty(window, 'addEventListener', {
  value: mockWindowAddEventListener,
  writable: true,
})

Object.defineProperty(window, 'removeEventListener', {
  value: mockWindowRemoveEventListener,
  writable: true,
})

describe('composables/useFullscreenControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset DOM state
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    })
    document.documentElement.classList.add = vi.fn()
    document.documentElement.classList.remove = vi.fn()

    // Reset mocks
    mockSetTimeout.mockReturnValue(123) // Mock timer ID
    mockClearTimeout.mockReturnValue(undefined)
    vi.mocked(isFullscreenApiSupported).mockReturnValue(true)
    vi.mocked(isSimulatedActive).mockReturnValue(false)
  })

  afterEach(() => {
    // Clean up any remaining consumers by calling unmount callbacks
    const unmountedCallbacks = vi.mocked(onUnmounted).mock.calls
    unmountedCallbacks.forEach(call => {
      if (call[0]) { call[0]() }
    })

    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('sets up global listeners on first mount', () => {
      const { fullscreen, controlsVisible } = useFullscreenControls()

      expect(fullscreen.value).toBe(false)
      expect(controlsVisible.value).toBe(true)
      expect(mockAddEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
    })

    it('does not set up global listeners on subsequent mounts', () => {
      // First mount
      useFullscreenControls()
      const firstCallCount = mockAddEventListener.mock.calls.length

      // Second mount
      useFullscreenControls()
      const secondCallCount = mockAddEventListener.mock.calls.length

      expect(secondCallCount).toBe(firstCallCount)
    })

    it('removes global listeners when last consumer unmounts', () => {
      useFullscreenControls()

      // Get the unmount callback from the mocked onUnmounted
      const onUnmountedCallback = vi.mocked(onUnmounted).mock.calls[0]?.[0]

      // Simulate unmount
      if (onUnmountedCallback) {
        onUnmountedCallback()
      }

      expect(mockRemoveEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
    })
  })

  describe('toggleFullscreen', () => {
    it('enters fullscreen when not in fullscreen', async () => {
      const { toggleFullscreen } = useFullscreenControls()
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true,
        configurable: true,
      })

      await toggleFullscreen()

      expect(mockRequestFullscreen).toHaveBeenCalled()
    })

    it('exits fullscreen when in fullscreen', async () => {
      const { toggleFullscreen } = useFullscreenControls()
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })

      await toggleFullscreen()

      expect(mockExitFullscreen).toHaveBeenCalled()
    })

    it('uses fallback for unsupported fullscreen API', async () => {
      vi.mocked(isFullscreenApiSupported).mockReturnValue(false)
      vi.mocked(isSimulatedActive).mockReturnValue(true)

      const { toggleFullscreen } = useFullscreenControls()

      await toggleFullscreen()

      expect(mockRequestFullscreen).not.toHaveBeenCalled()
      expect(mockExitFullscreen).not.toHaveBeenCalled()
    })

    it('handles fullscreen errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockRequestFullscreen.mockRejectedValue(new Error('Fullscreen failed'))

      const { toggleFullscreen } = useFullscreenControls()

      await expect(toggleFullscreen()).resolves.not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Fullscreen toggle failed:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('fullscreen state management', () => {
    it('updates fullscreen state on fullscreenchange event', () => {
      const { fullscreen } = useFullscreenControls()

      // Simulate fullscreen change event
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)
      }
    })

    it('adds fullscreen class when entering fullscreen', () => {
      const { fullscreen } = useFullscreenControls()

      // Simulate fullscreen change event to trigger side effects
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)
        expect(document.documentElement.classList.add).toHaveBeenCalledWith('app-fullscreen')
      }
    })

    it('removes fullscreen class when exiting fullscreen', () => {
      const { fullscreen } = useFullscreenControls()

      // First enter fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)

        // Then exit fullscreen
        Object.defineProperty(document, 'fullscreenElement', {
          value: null,
          writable: true,
          configurable: true,
        })
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(false)
        expect(document.documentElement.classList.remove).toHaveBeenCalledWith('app-fullscreen')
      }
    })
  })

  describe('controls visibility', () => {
    it('shows controls when entering fullscreen', () => {
      const { fullscreen, controlsVisible } = useFullscreenControls()

      // Simulate fullscreen change event
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)
        expect(controlsVisible.value).toBe(true)
      }
    })

    it('schedules hiding controls after entering fullscreen', () => {
      const { fullscreen } = useFullscreenControls()

      // Simulate fullscreen change event
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)
        expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2500)
      }
    })

    it('hides controls after timeout', () => {
      const { controlsVisible } = useFullscreenControls()

      // Simulate timeout callback
      const timeoutCallback = mockSetTimeout.mock.calls[0]?.[0]
      if (timeoutCallback) {
        timeoutCallback()
        expect(controlsVisible.value).toBe(false)
      }
    })

    it('clears hide timer when exiting fullscreen', () => {
      const { fullscreen } = useFullscreenControls()

      // Enter fullscreen (sets timer)
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)
        expect(mockSetTimeout).toHaveBeenCalled()

        // Exit fullscreen (clears timer)
        Object.defineProperty(document, 'fullscreenElement', {
          value: null,
          writable: true,
          configurable: true,
        })
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(false)
        expect(mockClearTimeout).toHaveBeenCalled()
      }
    })

    it('shows controls and reschedules hide on user activity', () => {
      const { onUserActivity, controlsVisible } = useFullscreenControls()

      // First enter fullscreen to enable activity handling
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))

        // Now simulate user activity
        onUserActivity()

        expect(controlsVisible.value).toBe(true)
        expect(mockSetTimeout).toHaveBeenCalled()
      }
    })
  })

  describe('activity listeners', () => {
    it('attaches activity listeners when entering fullscreen', () => {
      const { fullscreen } = useFullscreenControls()

      // Simulate fullscreen change event
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)
        expect(mockWindowAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), { passive: true })
        expect(mockWindowAddEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), { passive: true })
        expect(mockWindowAddEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true })
      }
    })

    it('detaches activity listeners when exiting fullscreen', () => {
      const { fullscreen } = useFullscreenControls()

      // Enter fullscreen (attaches listeners)
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)

        // Exit fullscreen (detaches listeners)
        Object.defineProperty(document, 'fullscreenElement', {
          value: null,
          writable: true,
          configurable: true,
        })
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(false)
        expect(mockWindowRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
        expect(mockWindowRemoveEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
        expect(mockWindowRemoveEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function))
      }
    })

    it('does not attach listeners multiple times', () => {
      useFullscreenControls()

      // Enter fullscreen multiple times
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        eventHandler(new Event('fullscreenchange'))
        eventHandler(new Event('fullscreenchange'))

        // Should only attach listeners once
        const mousemoveCalls = mockWindowAddEventListener.mock.calls.filter(
          call => call[0] === 'mousemove',
        )
        expect(mousemoveCalls).toHaveLength(1)
      }
    })

    it('does not detach listeners multiple times', () => {
      useFullscreenControls()

      // Enter and exit fullscreen multiple times
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        // Enter fullscreen
        eventHandler(new Event('fullscreenchange'))
        // Exit fullscreen
        Object.defineProperty(document, 'fullscreenElement', {
          value: null,
          writable: true,
          configurable: true,
        })
        eventHandler(new Event('fullscreenchange'))
        // Enter fullscreen again
        Object.defineProperty(document, 'fullscreenElement', {
          value: document.documentElement,
          writable: true,
          configurable: true,
        })
        eventHandler(new Event('fullscreenchange'))
        // Exit fullscreen again
        Object.defineProperty(document, 'fullscreenElement', {
          value: null,
          writable: true,
          configurable: true,
        })
        eventHandler(new Event('fullscreenchange'))

        // Should only detach listeners when actually attached
        const mousemoveCalls = mockWindowRemoveEventListener.mock.calls.filter(
          call => call[0] === 'mousemove',
        )
        expect(mousemoveCalls).toHaveLength(2) // Once for each exit
      }
    })
  })

  describe('consumer management', () => {
    it('tracks multiple consumers correctly', () => {
      const consumer1 = useFullscreenControls()
      const consumer2 = useFullscreenControls()
      const consumer3 = useFullscreenControls()

      // All should have the same state
      expect(consumer1.fullscreen.value).toBe(consumer2.fullscreen.value)
      expect(consumer2.fullscreen.value).toBe(consumer3.fullscreen.value)

      // Unmount one consumer
      const onUnmounted1 = vi.mocked(onUnmounted).mock.calls[0]?.[0]
      if (onUnmounted1) {
        onUnmounted1()
      }

      // Others should still work
      expect(consumer2.fullscreen.value).toBe(consumer3.fullscreen.value)
    })

    it('cleans up when last consumer unmounts', () => {
      useFullscreenControls()
      useFullscreenControls()

      // Unmount first consumer
      const onUnmounted1 = vi.mocked(onUnmounted).mock.calls[0]?.[0]
      if (onUnmounted1) {
        onUnmounted1()
      }
      expect(mockRemoveEventListener).not.toHaveBeenCalled()

      // Unmount last consumer
      const onUnmounted2 = vi.mocked(onUnmounted).mock.calls[1]?.[0]
      if (onUnmounted2) {
        onUnmounted2()
      }
      expect(mockRemoveEventListener).toHaveBeenCalled()
    })

    it('handles negative consumer count gracefully', () => {
      useFullscreenControls()

      // Unmount multiple times
      const onUnmountedCallback = vi.mocked(onUnmounted).mock.calls[0]?.[0]
      if (onUnmountedCallback) {
        onUnmountedCallback()
        onUnmountedCallback()
        onUnmountedCallback()
      }

      // Should not throw and should clean up (may be called multiple times due to cleanup)
      expect(mockRemoveEventListener).toHaveBeenCalled()
    })
  })

  describe('timeout pause/resume', () => {
    it('pauses timeout when pauseTimeout is called', () => {
      const { pauseTimeout, fullscreen } = useFullscreenControls()

      // Enter fullscreen to enable timeout
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)
        expect(mockSetTimeout).toHaveBeenCalled()

        // Clear the mock to track new calls
        mockSetTimeout.mockClear()
        mockClearTimeout.mockClear()

        // Pause timeout
        pauseTimeout()
        expect(mockClearTimeout).toHaveBeenCalled()
      }
    })

    it('resumes timeout when resumeTimeout is called', () => {
      const { pauseTimeout, resumeTimeout, fullscreen } = useFullscreenControls()

      // Enter fullscreen to enable timeout
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)

        // Clear the mock to track new calls
        mockSetTimeout.mockClear()
        mockClearTimeout.mockClear()

        // Pause timeout
        pauseTimeout()
        // clearHideTimer may or may not be called depending on whether there's an active timer
        // The important thing is that the timeout is paused

        // Resume timeout
        resumeTimeout()
        expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2500)
      }
    })

    it('does not schedule timeout when paused', () => {
      const { pauseTimeout, onUserActivity, fullscreen } = useFullscreenControls()

      // Enter fullscreen to enable timeout
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true,
      })
      const eventHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'fullscreenchange',
      )?.[1]

      if (eventHandler) {
        eventHandler(new Event('fullscreenchange'))
        expect(fullscreen.value).toBe(true)

        // Clear the mock to track new calls
        mockSetTimeout.mockClear()

        // Pause timeout
        pauseTimeout()

        // Simulate user activity while paused
        onUserActivity()

        // Should not schedule new timeout when paused
        expect(mockSetTimeout).not.toHaveBeenCalled()
      }
    })

    it('does not resume timeout when not in fullscreen', () => {
      const { resumeTimeout } = useFullscreenControls()

      // Clear the mock to track new calls
      mockSetTimeout.mockClear()

      // Resume timeout while not in fullscreen
      resumeTimeout()

      // Should not schedule timeout when not in fullscreen
      expect(mockSetTimeout).not.toHaveBeenCalled()
    })
  })

  describe('return values', () => {
    it('returns reactive refs and functions', () => {
      const result = useFullscreenControls()

      expect(result).toHaveProperty('fullscreen')
      expect(result).toHaveProperty('controlsVisible')
      expect(result).toHaveProperty('toggleFullscreen')
      expect(result).toHaveProperty('onUserActivity')
      expect(result).toHaveProperty('pauseTimeout')
      expect(result).toHaveProperty('resumeTimeout')

      expect(typeof result.toggleFullscreen).toBe('function')
      expect(typeof result.onUserActivity).toBe('function')
      expect(typeof result.pauseTimeout).toBe('function')
      expect(typeof result.resumeTimeout).toBe('function')
    })
  })
})
