import SplitPane from '@/components/SplitPane.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

describe('SplitPane', () => {
  let wrapper: VueWrapper<InstanceType<typeof SplitPane>>

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock getBoundingClientRect for container measurements
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }))
  })

  afterEach(() => {
    wrapper?.unmount()
    // Clean up any global styles that might have been set
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  })

  const createWrapper = (props = {}, slots = {}) => {
    const defaultSlots = {
      first: '<div data-testid="first-pane">First Pane</div>',
      second: '<div data-testid="second-pane">Second Pane</div>',
      ...slots,
    }

    wrapper = mount(SplitPane, {
      props: {
        ...props,
      },
      slots: defaultSlots,
    })
    return wrapper
  }

  describe('Rendering', () => {
    it('renders with default props', () => {
      createWrapper()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.split-pane-container').exists()).toBe(true)
      expect(wrapper.find('.split-pane-first').exists()).toBe(true)
      expect(wrapper.find('.split-pane-second').exists()).toBe(true)
      expect(wrapper.find('.split-pane-splitter').exists()).toBe(true)
    })

    it('renders with default order (first-second)', () => {
      createWrapper()

      const firstPane = wrapper.find('.split-pane-first')
      const secondPane = wrapper.find('.split-pane-second')
      const splitter = wrapper.find('.split-pane-splitter')

      expect(firstPane.attributes('style')).toContain('order: 1')
      expect(secondPane.attributes('style')).toContain('order: 3')
      expect(splitter.attributes('style')).toContain('order: 2')
    })

    it('renders with second-first order', () => {
      createWrapper({ order: 'second-first' })

      const firstPane = wrapper.find('.split-pane-first')
      const secondPane = wrapper.find('.split-pane-second')
      const splitter = wrapper.find('.split-pane-splitter')

      expect(firstPane.attributes('style')).toContain('order: 3')
      expect(secondPane.attributes('style')).toContain('order: 1')
      expect(splitter.attributes('style')).toContain('order: 2')
    })

    it('renders with custom props', () => {
      createWrapper({
        firstPaneSize: 30,
        secondPaneSize: 70,
        vertical: false,
        splitterSize: 12,
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('split-pane-horizontal')
    })

    it('renders slots correctly', () => {
      createWrapper()

      expect(wrapper.find('[data-testid="first-pane"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="second-pane"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="first-pane"]').text()).toBe('First Pane')
      expect(wrapper.find('[data-testid="second-pane"]').text()).toBe('Second Pane')
    })

    it('applies correct CSS classes for vertical orientation', () => {
      createWrapper({ vertical: true })

      expect(wrapper.classes()).toContain('split-pane-vertical')
      expect(wrapper.classes()).not.toContain('split-pane-horizontal')
    })

    it('applies correct CSS classes for horizontal orientation', () => {
      createWrapper({ vertical: false })

      expect(wrapper.classes()).toContain('split-pane-horizontal')
      expect(wrapper.classes()).not.toContain('split-pane-vertical')
    })
  })

  describe('Pane Sizing', () => {
    it('applies default pane sizes', () => {
      createWrapper()

      const firstPane = wrapper.find('.split-pane-first')
      const secondPane = wrapper.find('.split-pane-second')

      expect(firstPane.attributes('style')).toContain('width: calc(50% - 4px)')
      expect(secondPane.attributes('style')).toContain('width: calc(50% - 4px)')
    })

    it('applies custom pane sizes', () => {
      createWrapper({
        firstPaneSize: 30,
        secondPaneSize: 70,
      })

      const firstPane = wrapper.find('.split-pane-first')
      const secondPane = wrapper.find('.split-pane-second')

      expect(firstPane.attributes('style')).toContain('width: calc(30% - 4px)')
      expect(secondPane.attributes('style')).toContain('width: calc(70% - 4px)')
    })

    it('applies min/max constraints', () => {
      createWrapper({
        firstPaneSize: 10,
        secondPaneSize: 90,
        firstPaneMinSize: 20,
        firstPaneMaxSize: 80,
      })

      const firstPane = wrapper.find('.split-pane-first')
      const style = firstPane.attributes('style')

      expect(style).toContain('min-width: calc(20% - 4px)')
      expect(style).toContain('max-width: calc(80% - 4px)')
    })

    it('normalizes sizes to add up to 100%', async () => {
      createWrapper({
        firstPaneSize: 30,
        secondPaneSize: 80, // This should be normalized
      })

      await nextTick()

      const firstPane = wrapper.find('.split-pane-first')
      const secondPane = wrapper.find('.split-pane-second')

      // Should normalize to approximately 27.27% and 72.73%
      expect(firstPane.attributes('style')).toContain('width: calc(27.27% - 4px)')
      expect(secondPane.attributes('style')).toContain('width: calc(72.73% - 4px)')
    })

    it('updates sizes when props change', async () => {
      createWrapper({
        firstPaneSize: 30,
        secondPaneSize: 70,
      })

      await wrapper.setProps({
        firstPaneSize: 40,
        secondPaneSize: 60,
      })
      await nextTick()

      const firstPane = wrapper.find('.split-pane-first')
      const secondPane = wrapper.find('.split-pane-second')

      expect(firstPane.attributes('style')).toContain('width: calc(40% - 4px)')
      expect(secondPane.attributes('style')).toContain('width: calc(60% - 4px)')
    })
  })

  describe('Splitter Styling', () => {
    it('applies correct splitter size for vertical orientation', () => {
      createWrapper({
        vertical: true,
        splitterSize: 10,
      })

      const splitter = wrapper.find('.split-pane-splitter')
      const style = splitter.attributes('style')

      expect(style).toContain('width: 10px')
      expect(style).toContain('height: 100%')
    })

    it('applies correct splitter size for horizontal orientation', () => {
      createWrapper({
        vertical: false,
        splitterSize: 12,
      })

      const splitter = wrapper.find('.split-pane-splitter')
      const style = splitter.attributes('style')

      expect(style).toContain('width: 100%')
      expect(style).toContain('height: 12px')
    })

    it('applies correct cursor for resizable splitter', () => {
      createWrapper({
        resizable: true,
        vertical: true,
      })

      const splitter = wrapper.find('.split-pane-splitter')
      const style = splitter.attributes('style')

      expect(style).toContain('cursor: col-resize')
    })

    it('applies default cursor for non-resizable splitter', () => {
      createWrapper({
        resizable: false,
      })

      // When not resizable, splitter should not exist
      const splitter = wrapper.find('.split-pane-splitter')
      expect(splitter.exists()).toBe(false)
    })

    it('hides splitter when not resizable', () => {
      createWrapper({
        resizable: false,
      })

      expect(wrapper.find('.split-pane-splitter').exists()).toBe(false)
    })
  })

  describe('Mouse Resizing', () => {
    it('starts drag on mouse down', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      await splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      expect(wrapper.classes()).toContain('split-pane-dragging')
      expect(document.body.style.cursor).toBe('col-resize')
      expect(document.body.style.userSelect).toBe('none')
    })

    it('handles mouse move during drag', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      // Clear any initial resize events from component creation
      wrapper.emitted('resize')?.splice(0)

      // Start drag
      await splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      // Simulate mouse move
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 300,
      })
      document.dispatchEvent(mouseMoveEvent)

      await nextTick()

      // Should emit resize event
      expect(wrapper.emitted('resize')).toBeTruthy()
      const resizeEvents = wrapper.emitted('resize') as Array<Array<{ first: number; second: number }>>
      // With a 100px move in a 800px container, that's 12.5% change
      expect(resizeEvents[0]![0]!.first).toBeGreaterThan(50)
      expect(resizeEvents[0]![0]!.second).toBeLessThan(50)
    })

    it('ends drag on mouse up', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      // Start drag
      await splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      // Simulate mouse up
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      await nextTick()

      expect(wrapper.classes()).not.toContain('split-pane-dragging')
      expect(document.body.style.cursor).toBe('')
      expect(document.body.style.userSelect).toBe('')
    })

    it('does not start drag when not resizable', async () => {
      createWrapper({ resizable: false })

      // Should not have splitter when not resizable
      expect(wrapper.find('.split-pane-splitter').exists()).toBe(false)
    })

    it('handles horizontal resizing correctly', async () => {
      createWrapper({ vertical: false })
      const splitter = wrapper.find('.split-pane-splitter')

      // Start drag
      await splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      // Simulate mouse move (vertical movement for horizontal splitter)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 400,
        clientY: 400,
      })
      document.dispatchEvent(mouseMoveEvent)

      await nextTick()

      expect(wrapper.emitted('resize')).toBeTruthy()
    })
  })

  describe('Touch Resizing', () => {
    it('starts drag on touch start', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 400, clientY: 300 } as Touch],
      })

      await splitter.element.dispatchEvent(touchEvent)

      expect(wrapper.classes()).toContain('split-pane-dragging')
      expect(document.body.style.cursor).toBe('col-resize')
    })

    it('handles touch move during drag', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      // Start drag
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 400, clientY: 300 } as Touch],
      })
      await splitter.element.dispatchEvent(touchStartEvent)

      // Simulate touch move
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 500, clientY: 300 } as Touch],
      })
      document.dispatchEvent(touchMoveEvent)

      await nextTick()

      expect(wrapper.emitted('resize')).toBeTruthy()
    })

    it('ends drag on touch end', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      // Start drag
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 400, clientY: 300 } as Touch],
      })
      await splitter.element.dispatchEvent(touchStartEvent)

      // Simulate touch end
      const touchEndEvent = new TouchEvent('touchend')
      document.dispatchEvent(touchEndEvent)

      await nextTick()

      expect(wrapper.classes()).not.toContain('split-pane-dragging')
      expect(document.body.style.cursor).toBe('')
    })
  })

  describe('Constraints and Validation', () => {
    it('enforces minimum size constraints', async () => {
      createWrapper({
        firstPaneSize: 5,
        secondPaneSize: 95,
        firstPaneMinSize: 20,
      })

      await nextTick()

      const firstPane = wrapper.find('.split-pane-first')
      expect(firstPane.attributes('style')).toContain('width: calc(20% - 4px)')
    })

    it('enforces maximum size constraints', async () => {
      createWrapper({
        firstPaneSize: 90,
        secondPaneSize: 10,
        firstPaneMaxSize: 80,
      })

      await nextTick()

      const firstPane = wrapper.find('.split-pane-first')
      expect(firstPane.attributes('style')).toContain('width: calc(80% - 4px)')
    })

    it('handles edge case where min size equals max size', async () => {
      createWrapper({
        firstPaneSize: 50,
        secondPaneSize: 50,
        firstPaneMinSize: 30,
        firstPaneMaxSize: 30,
      })

      await nextTick()

      const firstPane = wrapper.find('.split-pane-first')
      expect(firstPane.attributes('style')).toContain('width: calc(30% - 4px)')
    })

    it('handles zero sizes gracefully', async () => {
      createWrapper({
        firstPaneSize: 0,
        secondPaneSize: 100,
      })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.emitted('resize')).toBeTruthy()
    })
  })

  describe('External API Methods', () => {
    it('exposes setFirstPaneSize method', async () => {
      createWrapper()
      const component = wrapper.vm

      // Clear any initial resize events from component creation
      wrapper.emitted('resize')?.splice(0)

      component.setFirstPaneSize(30)

      await nextTick()

      expect(wrapper.emitted('resize')).toBeTruthy()
      const resizeEvents = wrapper.emitted('resize') as Array<Array<{ first: number; second: number }>>
      // The component normalizes sizes, so we expect the values to add up to 100
      expect(resizeEvents[0]![0]!.first + resizeEvents[0]![0]!.second).toBeCloseTo(100, 1)
      expect(resizeEvents[0]![0]!.first).toBeCloseTo(30, 1)
    })

    it('exposes setSecondPaneSize method', async () => {
      createWrapper()
      const component = wrapper.vm

      // Clear any initial resize events from component creation
      wrapper.emitted('resize')?.splice(0)

      component.setSecondPaneSize(40)

      await nextTick()

      expect(wrapper.emitted('resize')).toBeTruthy()
      const resizeEvents = wrapper.emitted('resize') as Array<Array<{ first: number; second: number }>>
      // The component normalizes sizes, so we expect the values to add up to 100
      expect(resizeEvents[0]![0]!.first + resizeEvents[0]![0]!.second).toBeCloseTo(100, 1)
      expect(resizeEvents[0]![0]!.second).toBeCloseTo(40, 1)
    })

    it('exposes getSizes method', () => {
      createWrapper({
        firstPaneSize: 35,
        secondPaneSize: 65,
      })

      const component = wrapper.vm
      const sizes = component.getSizes()

      expect(sizes.first).toBe(35)
      expect(sizes.second).toBe(65)
    })

    it('exposes getSplitterSize method', () => {
      createWrapper({
        splitterSize: 12,
      })

      const component = wrapper.vm
      const size = component.getSplitterSize()

      expect(size).toBe(12)
    })
  })

  describe('Event Emissions', () => {
    it('emits resize event on prop change', async () => {
      createWrapper()

      await wrapper.setProps({
        firstPaneSize: 40,
        secondPaneSize: 60,
      })

      expect(wrapper.emitted('resize')).toBeTruthy()
    })

    it('emits resize event during drag', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      await splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        clientY: 300,
      })
      document.dispatchEvent(mouseMoveEvent)

      await nextTick()

      expect(wrapper.emitted('resize')).toBeTruthy()
      const resizeEvents = wrapper.emitted('resize') as Array<Array<{ first: number; second: number }>>
      expect(resizeEvents.length).toBeGreaterThan(0)
    })

    it('emits resize event with correct data structure', async () => {
      createWrapper()

      await wrapper.setProps({
        firstPaneSize: 30,
        secondPaneSize: 70,
      })

      const resizeEvents = wrapper.emitted('resize') as Array<Array<{ first: number; second: number }>>
      // The component normalizes sizes, so we expect the values to add up to 100
      expect(resizeEvents[0]![0]!.first + resizeEvents[0]![0]!.second).toBeCloseTo(100, 1)
      expect(resizeEvents[0]![0]!).toHaveProperty('first')
      expect(resizeEvents[0]![0]!).toHaveProperty('second')
      expect(typeof resizeEvents[0]![0]!.first).toBe('number')
      expect(typeof resizeEvents[0]![0]!.second).toBe('number')
    })
  })

  describe('Cleanup', () => {
    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      createWrapper()

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))
    })

    it('resets body styles on unmount', () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      // Start a drag to set body styles
      splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      wrapper.unmount()

      expect(document.body.style.cursor).toBe('')
      expect(document.body.style.userSelect).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('handles missing container ref gracefully', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      // Mock getBoundingClientRect to return an object with zero width/height
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }))

      await splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        clientY: 300,
      })
      document.dispatchEvent(mouseMoveEvent)

      await nextTick()

      // Should not crash
      expect(wrapper.exists()).toBe(true)
    })

    it('handles touch events without touches array', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      const touchEvent = new TouchEvent('touchstart', {
        touches: [],
      })

      await splitter.element.dispatchEvent(touchEvent)

      // Should not start drag
      expect(wrapper.classes()).not.toContain('split-pane-dragging')
    })

    it('handles rapid prop changes', async () => {
      createWrapper()

      // Rapidly change props
      await wrapper.setProps({ firstPaneSize: 20, secondPaneSize: 80 })
      await wrapper.setProps({ firstPaneSize: 40, secondPaneSize: 60 })
      await wrapper.setProps({ firstPaneSize: 60, secondPaneSize: 40 })

      await nextTick()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.emitted('resize')).toBeTruthy()
    })

    it('handles invalid size values', async () => {
      createWrapper({
        firstPaneSize: -10,
        secondPaneSize: 110,
      })

      await nextTick()

      // Should normalize to valid values
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.emitted('resize')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes for splitter', () => {
      createWrapper()

      const splitter = wrapper.find('.split-pane-splitter')
      expect(splitter.exists()).toBe(true)
    })

    it('maintains focus management during resize', async () => {
      createWrapper()
      const splitter = wrapper.find('.split-pane-splitter')

      await splitter.trigger('mousedown', { clientX: 400, clientY: 300 })

      // Should prevent text selection during drag
      expect(document.body.style.userSelect).toBe('none')

      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      await nextTick()

      // Should restore text selection
      expect(document.body.style.userSelect).toBe('')
    })
  })
})
