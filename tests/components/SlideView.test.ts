import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SlideView from '@/components/SlideView.vue'
import { createTestingPinia } from '@pinia/testing'
import PDFPageView from '@/components/PDFPageView.vue'

describe('SlideView', () => {
  it('should render PDF page view and overlay canvases', () => {
    const wrapper = mount(SlideView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              recording: {
                recording: null,
              },
            },
          }),
        ],
      },
    })

    const pdfPageView = wrapper.findComponent(PDFPageView)
    expect(pdfPageView.exists()).toBe(true)

    const actionCanvas = wrapper.find('canvas.action-canvas')
    expect(actionCanvas.exists()).toBe(true)

    const volatileCanvas = wrapper.find('canvas.volatile-canvas')
    expect(volatileCanvas.exists()).toBe(true)
  })
})
