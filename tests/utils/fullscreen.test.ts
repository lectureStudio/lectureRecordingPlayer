import { describe, it, expect, beforeEach } from 'vitest'
import { isFullscreenApiSupported, isSimulatedActive } from '@/utils/fullscreen'

describe('utils/fullscreen', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('app-fullscreen')
    // Clean existing properties
    // @ts-ignore
    delete document.documentElement.requestFullscreen
    // @ts-ignore
    delete document.documentElement.webkitRequestFullscreen
    // @ts-ignore
    delete document.documentElement.mozRequestFullScreen
  })

  it('detects standard Fullscreen API if present', () => {
    // @ts-ignore
    document.documentElement.requestFullscreen = () => Promise.resolve()
    expect(isFullscreenApiSupported()).toBe(true)
  })

  it('detects vendor-prefixed fullscreen methods', () => {
    expect(isFullscreenApiSupported()).toBe(false)
    // @ts-ignore
    document.documentElement.webkitRequestFullscreen = () => {}
    expect(isFullscreenApiSupported()).toBe(true)
    // reset and test moz
    // @ts-ignore
    delete document.documentElement.webkitRequestFullscreen
    // @ts-ignore
    document.documentElement.mozRequestFullScreen = () => {}
    expect(isFullscreenApiSupported()).toBe(true)
  })

  it('detects simulated fullscreen via class', () => {
    expect(isSimulatedActive()).toBe(false)
    document.documentElement.classList.add('app-fullscreen')
    expect(isSimulatedActive()).toBe(true)
  })
})
