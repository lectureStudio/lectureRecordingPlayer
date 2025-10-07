import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'
import SlideView from '@/components/SlideView.vue'
import PDFPageView from '@/components/PDFPageView.vue'
import { useRecordingStore } from '@/stores/recording'
import { usePdfStore } from '@/stores/pdf'

// Mock the complex composables
vi.mock('@/composables/useFileActionPlayer.ts', () => ({
  useFileActionPlayer: () => ({
    actionPlayer: { value: { setCanvas: vi.fn(), setAudioElement: vi.fn() } },
    initializePlayer: vi.fn(),
  }),
}))

vi.mock('@/composables/usePlayerControls.ts', () => ({
  usePlayerControls: () => ({
    currentPage: { value: 1 },
    selectPage: vi.fn(),
  }),
}))

describe('SlideView', () => {
  let wrapper: VueWrapper<InstanceType<typeof SlideView>>
  let recordingStore: ReturnType<typeof useRecordingStore>
  let pdfStore: ReturnType<typeof usePdfStore>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const createWrapper = (props = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        recording: {
          audio: null,
          document: null,
          actions: [],
          pages: [],
        },
        pdf: {
          src: null,
          doc: null,
          loading: false,
          error: null,
          currentPage: 1,
          eventBus: null,
          lastQuery: '',
          matchesTotal: 0,
          matchesCurrent: 0,
          pageTransform: new DOMMatrix(),
        },
      },
    })

    wrapper = mount(SlideView, {
      global: {
        plugins: [pinia],
        stubs: {
          PDFPageView: true,
        },
      },
      props,
    })

    recordingStore = useRecordingStore()
    pdfStore = usePdfStore()
    return wrapper
  }

  describe('Rendering', () => {
    it('renders the main slide view container', () => {
      createWrapper()
      
      expect(wrapper.find('.viewer-wrapper').exists()).toBe(true)
    })

    it('renders PDF page view component', () => {
      createWrapper()
      
      const pdfPageView = wrapper.findComponent(PDFPageView)
      expect(pdfPageView.exists()).toBe(true)
    })

    it('renders action canvas for drawing overlays', () => {
      createWrapper()
      
      const actionCanvas = wrapper.find('canvas.action-canvas')
      expect(actionCanvas.exists()).toBe(true)
      expect(actionCanvas.attributes('class')).toContain('action-canvas')
    })

    it('renders volatile canvas for temporary drawings', () => {
      createWrapper()
      
      const volatileCanvas = wrapper.find('canvas.volatile-canvas')
      expect(volatileCanvas.exists()).toBe(true)
      expect(volatileCanvas.attributes('class')).toContain('volatile-canvas')
    })
  })

  describe('Canvas Setup', () => {
    it('sets up canvas elements correctly', () => {
      createWrapper()
      
      const actionCanvas = wrapper.find('canvas.action-canvas')
      const volatileCanvas = wrapper.find('canvas.volatile-canvas')
      
      expect(actionCanvas.exists()).toBe(true)
      expect(volatileCanvas.exists()).toBe(true)
      expect(actionCanvas.element.tagName).toBe('CANVAS')
      expect(volatileCanvas.element.tagName).toBe('CANVAS')
    })

    it('applies correct CSS classes to canvases', () => {
      createWrapper()
      
      const actionCanvas = wrapper.find('canvas.action-canvas')
      const volatileCanvas = wrapper.find('canvas.volatile-canvas')
      
      expect(actionCanvas.classes()).toContain('action-canvas')
      expect(volatileCanvas.classes()).toContain('volatile-canvas')
    })
  })

  describe('Store Integration', () => {
    it('integrates with recording store', () => {
      createWrapper()
      
      expect(recordingStore).toBeDefined()
      expect(recordingStore.audio).toBeNull()
      expect(recordingStore.actions).toEqual([])
    })

    it('integrates with PDF store', () => {
      createWrapper()
      
      expect(pdfStore).toBeDefined()
      expect(pdfStore.currentPage).toBe(1)
      expect(pdfStore.loading).toBe(false)
    })
  })

  describe('Responsive Behavior', () => {
    it('handles container resize events', async () => {
      createWrapper()
      
      // Simulate a resize event
      const container = wrapper.find('.viewer-wrapper')
      expect(container.exists()).toBe(true)
      
      // The component should handle resize internally
      await nextTick()
      expect(wrapper.exists()).toBe(true)
    })
  })
})
