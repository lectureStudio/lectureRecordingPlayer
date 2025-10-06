import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMediaControlsStore } from '@/stores/mediaControls'

describe('stores/mediaControls', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('setVolume clamps, unmutes, and updates prevVolume for non-zero', () => {
    const store = useMediaControlsStore()
    store.muted = true
    store.setVolume(150)
    expect(store.volume).toBe(100)
    expect(store.muted).toBe(false)
    expect(store.prevVolume).toBe(100)

    store.setVolume(-10)
    expect(store.volume).toBe(0)
    // prevVolume should remain the last non-zero (100)
    expect(store.prevVolume).toBe(100)
  })

  it('toggleMute stores previous volume and restores on unmute', () => {
    const store = useMediaControlsStore()
    store.volume = 30
    store.prevVolume = 50

    store.toggleMute() // mute
    expect(store.muted).toBe(true)
    expect(store.prevVolume).toBe(30)

    store.toggleMute() // unmute
    expect(store.muted).toBe(false)
    expect(store.volume).toBe(30)
  })

  it('toggleMute with zero volume restores from prevVolume or defaults', () => {
    const store = useMediaControlsStore()
    store.volume = 0
    store.prevVolume = 0

    store.toggleMute() // mute
    expect(store.muted).toBe(true)

    store.toggleMute() // unmute -> fallback to 50 because prevVolume and volume are 0
    expect(store.muted).toBe(false)
    expect(store.volume).toBe(50)
  })

  it('setPlaybackSpeed clamps to [0.25, 2]', () => {
    const store = useMediaControlsStore()
    store.setPlaybackSpeed(0.1)
    expect(store.playbackSpeed).toBe(0.25)
    store.setPlaybackSpeed(5)
    expect(store.playbackSpeed).toBe(2)
    store.setPlaybackSpeed(1.5)
    expect(store.playbackSpeed).toBe(1.5)
  })

  it('startSeeking/stopSeeking flags', () => {
    const store = useMediaControlsStore()
    expect(store.seeking).toBe(false)
    store.startSeeking()
    expect(store.seeking).toBe(true)
    store.stopSeeking()
    expect(store.seeking).toBe(false)
  })

  it('effectiveVolume getter respects muted state', () => {
    const store = useMediaControlsStore()
    store.volume = 80
    store.muted = false
    expect(store.effectiveVolume).toBe(80)
    store.muted = true
    expect(store.effectiveVolume).toBe(0)
  })
})
