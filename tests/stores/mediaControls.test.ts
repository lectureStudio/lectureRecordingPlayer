import { beforeEach, describe, expect, it, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMediaControlsStore } from '@/stores/mediaControls'

describe('stores/mediaControls', () => {
  let store: ReturnType<typeof useMediaControlsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMediaControlsStore()
  })

  afterEach(() => {
    // Reset store state
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
      store.setVolume(150)
      expect(store.volume).toBe(100)

      store.setVolume(-10)
      expect(store.volume).toBe(0)

      store.setVolume(50)
      expect(store.volume).toBe(50)
    })

    it('rounds volume to nearest integer', () => {
      store.setVolume(50.7)
      expect(store.volume).toBe(51)

      store.setVolume(50.3)
      expect(store.volume).toBe(50)
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
      store.setVolume(0)
      expect(store.volume).toBe(0)
      expect(store.muted).toBe(false)

      store.setVolume(100)
      expect(store.volume).toBe(100)
      expect(store.prevVolume).toBe(100)
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
      store.setPlaybackSpeed(0.1)
      expect(store.playbackSpeed).toBe(0.25)

      store.setPlaybackSpeed(5)
      expect(store.playbackSpeed).toBe(2)

      store.setPlaybackSpeed(1.5)
      expect(store.playbackSpeed).toBe(1.5)
    })

    it('handles edge values', () => {
      store.setPlaybackSpeed(0.25)
      expect(store.playbackSpeed).toBe(0.25)

      store.setPlaybackSpeed(2)
      expect(store.playbackSpeed).toBe(2)
    })

    it('converts string values to numbers', () => {
      store.setPlaybackSpeed('1.5' as unknown as number)
      expect(store.playbackSpeed).toBe(1.5)
    })

    it('handles invalid values', () => {
      store.setPlaybackSpeed(NaN)
      expect(store.playbackSpeed).toBeNaN() // NaN is not clamped

      store.setPlaybackSpeed(Infinity)
      expect(store.playbackSpeed).toBe(2) // Infinity is clamped to maximum
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
      store.currentTime = 120
      store.totalTime = 300
      store.playbackState = 'playing'

      expect(store.currentTime).toBe(120)
      expect(store.totalTime).toBe(300)
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
})
