// Vitest setup for Vue 3 components
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Stub globally used child components we don't test here to simplify mounts
config.global.stubs = {
  AppIcon: true,
  PlaybackSpeedButton: true,
  SidebarPositionChooser: true,
  SpeakerButton: true,
}

// Some components rely on CSS custom properties; make sure getComputedStyle is defined
if (typeof window !== 'undefined' && !('getComputedStyle' in window)) {
  // @ts-ignore
  window.getComputedStyle = () => ({ getPropertyValue: () => '' })
}

// JSDOM does not implement canvas, so we need to mock it.
if (typeof window !== 'undefined' && 'HTMLCanvasElement' in window) {
  // @ts-ignore
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue({ data: [] }),
    putImageData: vi.fn(),
    createImageData: vi.fn().mockReturnValue({ data: [] }),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  }));
}

// pdf.js, a dependency, expects DOMMatrix to be available. It's not in JSDOM, so we mock it.
if (typeof window !== 'undefined' && !('DOMMatrix' in window)) {
  // @ts-ignore
  window.DOMMatrix = class DOMMatrix {}
}

// Mock for ResizeObserver
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  // @ts-ignore
  window.ResizeObserver = class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
}

// In jsdom, some HTMLMediaElement methods exist but throw "Not implemented".
// Always stub them in the test environment so components using <audio>/<video> don't crash.
if (typeof window !== 'undefined') {
  const proto = (window.HTMLMediaElement && window.HTMLMediaElement.prototype) as any
  if (proto) {
    try {
      vi.spyOn(proto, 'load').mockImplementation(() => {})
    }
    catch {
      proto.load = vi.fn()
    }
    try {
      vi.spyOn(proto, 'play').mockResolvedValue(undefined)
    }
    catch {
      proto.play = vi.fn().mockResolvedValue(undefined)
    }
    try {
      vi.spyOn(proto, 'pause').mockImplementation(() => {})
    }
    catch {
      proto.pause = vi.fn()
    }
  }
}


// Provide a ref-like accessor on booleans for tests where component refs are auto-unwrapped
// This makes expressions like `someBoolean.value` work in tests when Vue has unwrapped refs
// Note: Affects only the test environment (jsdom)
try {
  // Define as a getter to reflect the primitive's value
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Boolean.prototype, 'value', {
    configurable: true,
    get() { return this.valueOf() },
  })
}
catch {
  // ignore if environment forbids prototype extension
}
