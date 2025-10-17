import { useMediaControlsStore } from '@/stores/mediaControls'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('stores/mediaControls', () => {
  let store: ReturnType<typeof useMediaControlsStore>

  // Helper function to reset store to default state
  const resetStore = () => {
    store.$patch({
      volume: 100,
      playbackSpeed: 1.0,
      muted: false,
      prevVolume: 100,
      currentTime: 0,
      totalTime: 0,
      playbackState: 'paused',
      seeking: false,
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMediaControlsStore()
  })

  afterEach(() => {
    resetStore()
  })

  describe('Initial State', () => {
    it('has correct default values', () => {
      expect(store.volume).toBe(100)
      expect(store.playbackSpeed).toBe(1.0)
      expect(store.muted).toBe(false)
      expect(store.prevVolume).toBe(100)
      expect(store.currentTime).toBe(0)
      expect(store.totalTime).toBe(0)
      expect(store.playbackState).toBe('paused')
      expect(store.seeking).toBe(false)
    })

    it('effectiveVolume getter returns correct value when not muted', () => {
      store.volume = 80
      store.muted = false
      expect(store.effectiveVolume).toBe(80)
    })

    it('effectiveVolume getter returns 0 when muted', () => {
      store.volume = 80
      store.muted = true
      expect(store.effectiveVolume).toBe(0)
    })
  })

  describe('setVolume', () => {
    it('clamps volume to valid range [0, 100]', () => {
      const testCases = [
        { input: 150, expected: 100 },
        { input: -10, expected: 0 },
        { input: 50, expected: 50 }
      ]

      testCases.forEach(({ input, expected }) => {
        store.setVolume(input)
        expect(store.volume).toBe(expected)
      })
    })

    it('rounds volume to nearest integer', () => {
      const testCases = [
        { input: 50.7, expected: 51 },
        { input: 50.3, expected: 50 }
      ]

      testCases.forEach(({ input, expected }) => {
        store.setVolume(input)
        expect(store.volume).toBe(expected)
      })
    })

    it('unmutes when volume is set', () => {
      store.muted = true
      store.setVolume(50)
      expect(store.muted).toBe(false)
    })

    it('updates prevVolume for non-zero values', () => {
      store.setVolume(75)
      expect(store.prevVolume).toBe(75)

      store.setVolume(0)
      expect(store.prevVolume).toBe(75) // Should remain unchanged
    })

    it('handles edge cases', () => {
      const testCases = [
        { volume: 0, muted: false, prevVolume: 100 },
        { volume: 100, muted: false, prevVolume: 100 }
      ]

      testCases.forEach(({ volume, muted, prevVolume }) => {
        store.setVolume(volume)
        expect(store.volume).toBe(volume)
        expect(store.muted).toBe(muted)
        expect(store.prevVolume).toBe(prevVolume)
      })
    })
  })

  describe('toggleMute', () => {
    it('mutes when currently unmuted', () => {
      store.volume = 30
      store.muted = false

      store.toggleMute()
      expect(store.muted).toBe(true)
      expect(store.prevVolume).toBe(30)
    })

    it('unmutes and restores previous volume when currently muted', () => {
      store.volume = 0
      store.prevVolume = 75
      store.muted = true

      store.toggleMute()
      expect(store.muted).toBe(false)
      expect(store.volume).toBe(75)
    })

    it('handles zero volume and zero prevVolume by defaulting to 50', () => {
      store.volume = 0
      store.prevVolume = 0
      store.muted = true

      store.toggleMute()
      expect(store.muted).toBe(false)
      expect(store.volume).toBe(50)
    })

    it('preserves current volume when unmuting if prevVolume is 0 but current volume > 0', () => {
      store.volume = 25
      store.prevVolume = 0
      store.muted = true

      store.toggleMute()
      expect(store.muted).toBe(false)
      expect(store.volume).toBe(25)
    })

    it('does not update prevVolume when muting with zero volume', () => {
      store.volume = 0
      store.prevVolume = 50
      store.muted = false

      store.toggleMute()
      expect(store.muted).toBe(true)
      expect(store.prevVolume).toBe(50) // Should remain unchanged
    })
  })

  describe('setPlaybackSpeed', () => {
    it('clamps playback speed to valid range [0.25, 2]', () => {
      const testCases = [
        { input: 0.1, expected: 0.25 },
        { input: 5, expected: 2 },
        { input: 1.5, expected: 1.5 }
      ]

      testCases.forEach(({ input, expected }) => {
        store.setPlaybackSpeed(input)
        expect(store.playbackSpeed).toBe(expected)
      })
    })

    it('handles edge values and special cases', () => {
      const testCases = [
        { input: 0.25, expected: 0.25 },
        { input: 2, expected: 2 },
        { input: '1.5' as unknown as number, expected: 1.5 },
        { input: NaN, expected: NaN },
        { input: Infinity, expected: 2 }
      ]

      testCases.forEach(({ input, expected }) => {
        store.setPlaybackSpeed(input)
        if (Number.isNaN(expected)) {
          expect(store.playbackSpeed).toBeNaN()
        } else {
          expect(store.playbackSpeed).toBe(expected)
        }
      })
    })
  })

  describe('Seeking Actions', () => {
    it('startSeeking sets seeking flag to true', () => {
      expect(store.seeking).toBe(false)
      store.startSeeking()
      expect(store.seeking).toBe(true)
    })

    it('stopSeeking sets seeking flag to false', () => {
      store.seeking = true
      store.stopSeeking()
      expect(store.seeking).toBe(false)
    })

    it('can toggle seeking state multiple times', () => {
      store.startSeeking()
      expect(store.seeking).toBe(true)

      store.stopSeeking()
      expect(store.seeking).toBe(false)

      store.startSeeking()
      expect(store.seeking).toBe(true)
    })
  })

  describe('State Management', () => {
    it('allows direct state modification', () => {
      store.currentTime = 120000 // 120 seconds in milliseconds
      store.totalTime = 300000 // 300 seconds in milliseconds
      store.playbackState = 'playing'

      expect(store.currentTime).toBe(120000)
      expect(store.totalTime).toBe(300000)
      expect(store.playbackState).toBe('playing')
    })

    it('maintains state consistency across actions', () => {
      store.setVolume(75)
      store.toggleMute()
      store.setPlaybackSpeed(1.5)
      store.startSeeking()

      expect(store.volume).toBe(75)
      expect(store.muted).toBe(true)
      expect(store.prevVolume).toBe(75)
      expect(store.playbackSpeed).toBe(1.5)
      expect(store.seeking).toBe(true)
    })
  })

  describe('Playback State', () => {
    it('accepts all valid playback states', () => {
      const states = ['paused', 'playing', 'ended', 'error'] as const

      states.forEach(state => {
        store.playbackState = state
        expect(store.playbackState).toBe(state)
      })
    })
  })

  describe('Toggle Play/Pause Callback', () => {
    it('initializes with null callback', () => {
      expect(store.togglePlayPauseCallback).toBe(null)
    })

    it('can set and clear the callback', () => {
      const mockCallback = vi.fn()

      store.setTogglePlayPauseCallback(mockCallback)
      expect(store.togglePlayPauseCallback).toBe(mockCallback)

      store.setTogglePlayPauseCallback(null)
      expect(store.togglePlayPauseCallback).toBe(null)
    })

    it('calls the registered callback when togglePlayPause is invoked', () => {
      const mockCallback = vi.fn()
      store.setTogglePlayPauseCallback(mockCallback)

      store.togglePlayPause()

      expect(mockCallback).toHaveBeenCalledOnce()
    })

    it('logs warning when togglePlayPause is called without callback', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.togglePlayPause()

      expect(consoleSpy).toHaveBeenCalledWith(
        'togglePlayPause called but no callback registered - ensure MediaControlsBar is mounted',
      )

      consoleSpy.mockRestore()
    })
  })
})
