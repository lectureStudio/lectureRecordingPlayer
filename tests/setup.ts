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
  // @ts-expect-error - adding getComputedStyle mock for test environment
  window.getComputedStyle = () => ({ getPropertyValue: () => '' })
}

// JSDOM does not implement canvas, so we need to mock it.
if (typeof window !== 'undefined' && 'HTMLCanvasElement' in window) {
  // @ts-expect-error - mocking HTMLCanvasElement.getContext for test environment
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
  // @ts-expect-error - adding DOMMatrix mock for test environment
  window.DOMMatrix = class DOMMatrix {}
}

// Mock for ResizeObserver
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  // @ts-expect-error - adding ResizeObserver mock for test environment
  window.ResizeObserver = class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
}

// In jsdom, some HTMLMediaElement methods exist but throw "Not implemented".
// Always stub them in the test environment so components using <audio>/<video> don't crash.
if (typeof window !== 'undefined') {
  const proto = (window.HTMLMediaElement && window.HTMLMediaElement.prototype) as HTMLMediaElement
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


// Mock PDF.js library for tests
if (typeof globalThis !== 'undefined') {
  // Mock the global pdfjsLib that PDF.js viewer components expect
  // @ts-expect-error - adding pdfjsLib mock to globalThis for test environment
  globalThis.pdfjsLib = {
    AbortException: class AbortException extends Error {
      constructor(message?: string) {
        super(message)
        this.name = 'AbortException'
      }
    },
    Util: {
      createObjectURL: vi.fn((blob: Blob) => URL.createObjectURL(blob)),
      revokeObjectURL: vi.fn((url: string) => URL.revokeObjectURL(url)),
    },
    getDocument: vi.fn(),
    GlobalWorkerOptions: {
      workerPort: null,
    },
  }

  // Mock PDF.js viewer components
  vi.mock('pdfjs-dist/web/pdf_viewer.mjs', () => ({
    EventBus: class EventBus {
      on = vi.fn()
      off = vi.fn()
      dispatch = vi.fn()
      _on = vi.fn()
    },
    PDFFindController: class PDFFindController {
      constructor() {}
      setDocument = vi.fn()
    },
    PDFLinkService: class PDFLinkService {
      constructor() {}
      setViewer = vi.fn()
      setDocument = vi.fn()
    },
    PDFPageView: class PDFPageView {
      constructor() {}
      pdfPage = null
      canvas = null
    },
    PDFSinglePageViewer: class PDFSinglePageViewer {
      constructor() {}
      setDocument = vi.fn()
      getPageView = vi.fn()
      refresh = vi.fn()
      currentScaleValue = 'page-fit'
      currentPageNumber = 1
    },
  }))

  // Mock PDF.js core
  vi.mock('pdfjs-dist', () => ({
    getDocument: vi.fn(),
    GlobalWorkerOptions: {
      workerPort: null,
    },
  }))
}

// Provide a ref-like accessor on booleans for tests where component refs are auto-unwrapped
// This makes expressions like `someBoolean.value` work in tests when Vue has unwrapped refs
// Note: Affects only the test environment (jsdom)
try {
  // Define as a getter to reflect the primitive's value
   
  Object.defineProperty(Boolean.prototype, 'value', {
    configurable: true,
    get() { return this.valueOf() },
  })
}
catch {
  // ignore if environment forbids prototype extension
}
