import { isFullscreenApiSupported, isSimulatedActive } from '@/utils/fullscreen'
import { beforeEach, describe, expect, it } from 'vitest'

describe('utils/fullscreen', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('app-fullscreen')
    // Clean existing properties
    // @ts-expect-error - deleting non-standard fullscreen API properties for test cleanup
    delete document.documentElement.requestFullscreen
    // @ts-expect-error - deleting webkit-prefixed fullscreen API property for test cleanup
    delete document.documentElement.webkitRequestFullscreen
    // @ts-expect-error - deleting moz-prefixed fullscreen API property for test cleanup
    delete document.documentElement.mozRequestFullScreen
  })

  it('detects standard Fullscreen API if present', () => {
    document.documentElement.requestFullscreen = () => Promise.resolve()
    expect(isFullscreenApiSupported()).toBe(true)
  })

  it('detects vendor-prefixed fullscreen methods', () => {
    expect(isFullscreenApiSupported()).toBe(false)
    // @ts-expect-error - adding webkit-prefixed fullscreen API method for testing
    document.documentElement.webkitRequestFullscreen = () => {}
    expect(isFullscreenApiSupported()).toBe(true)
    // reset and test moz
    // @ts-expect-error - deleting webkit-prefixed fullscreen API property for test reset
    delete document.documentElement.webkitRequestFullscreen
    // @ts-expect-error - adding moz-prefixed fullscreen API method for testing
    document.documentElement.mozRequestFullScreen = () => {}
    expect(isFullscreenApiSupported()).toBe(true)
  })

  it('detects simulated fullscreen via class', () => {
    expect(isSimulatedActive()).toBe(false)
    document.documentElement.classList.add('app-fullscreen')
    expect(isSimulatedActive()).toBe(true)
  })
})
